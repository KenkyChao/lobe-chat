import { execSync } from 'node:child_process';
import path from 'node:path';

import * as dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs-extra';

type ReleaseChannel = 'stable' | 'beta' | 'nightly' | 'canary';
type EnvName = 'development' | 'test' | 'prod';

const rootDir = path.resolve(__dirname, '../..');
const desktopDir = path.join(rootDir, 'apps/desktop');
const desktopPackageJsonPath = path.join(desktopDir, 'package.json');
const buildDir = path.join(desktopDir, 'build');

const iconTargets = ['icon.png', 'Icon.icns', 'icon.ico'];

const isFlag = (value: string) => value.startsWith('-');

const parseArgs = (args: string[]) => {
  let channel = '';
  let envName: EnvName | undefined;
  let version = '';
  let keepChanges = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--channel' || arg === '-c') {
      channel = args[i + 1] ?? '';
      i += 1;
      continue;
    }

    if (arg === '--env') {
      envName = args[i + 1] as EnvName | undefined;
      if (!envName || isFlag(envName)) {
        console.error('Missing env. Usage: --env <development|test|prod>');
        process.exit(1);
      }
      i += 1;
      continue;
    }

    if (arg.startsWith('--env=')) {
      envName = arg.slice('--env='.length) as EnvName;
      continue;
    }

    if (arg === '--version' || arg === '-v') {
      version = args[i + 1] ?? '';
      i += 1;
      continue;
    }

    if (arg === '--keep-changes') {
      keepChanges = true;
      continue;
    }

    if (!isFlag(arg)) {
      if (!channel) {
        channel = arg;
        continue;
      }

      if (!version) {
        version = arg;
      }
    }
  }

  return { channel, envName, keepChanges, version };
};

const resolveDefaultVersion = () => {
  const rootPackageJsonPath = path.join(rootDir, 'package.json');
  const rootPackageJson = fs.readJsonSync(rootPackageJsonPath);
  return rootPackageJson.version as string | undefined;
};

const backupFile = async (filePath: string) => {
  try {
    return await fs.readFile(filePath);
  } catch {
    return undefined;
  }
};

const restoreFile = async (filePath: string, content?: Buffer) => {
  if (!content) return;
  await fs.writeFile(filePath, content);
};

const validateChannel = (channel: string): channel is ReleaseChannel =>
  channel === 'stable' || channel === 'beta' || channel === 'nightly' || channel === 'canary';

const validateEnvName = (envName?: EnvName): envName is EnvName =>
  envName === 'development' || envName === 'test' || envName === 'prod';

const loadBuildEnv = (envName?: EnvName) => {
  if (!envName) return;

  if (!validateEnvName(envName)) {
    console.error('Invalid env. Usage: --env <development|test|prod>');
    process.exit(1);
  }

  const envPath = path.join(rootDir, `.env.${envName}`);
  if (!fs.existsSync(envPath)) {
    console.error(`Missing env file: ${envPath}`);
    process.exit(1);
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`Failed to load env file: ${envPath}`, result.error);
    process.exit(1);
  }

  dotenvExpand.expand(result);
};

const runCommand = (command: string, env?: Record<string, string | undefined>) => {
  execSync(command, {
    cwd: rootDir,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
};

const main = async () => {
  const { channel, envName, version: rawVersion, keepChanges } = parseArgs(process.argv.slice(2));

  if (!validateChannel(channel)) {
    console.error(
      'Missing or invalid channel. Usage: npm run desktop:build-channel -- <stable|beta|nightly|canary> [version] [--env <development|test|prod>] [--keep-changes]',
    );
    process.exit(1);
  }

  loadBuildEnv(envName);

  const version = rawVersion || resolveDefaultVersion();

  if (!version) {
    console.error('Missing version. Provide it or ensure root package.json has a version.');
    process.exit(1);
  }

  const packageJsonBackup = await backupFile(desktopPackageJsonPath);
  const iconBackups = await Promise.all(
    iconTargets.map(async (fileName) => ({
      content: await backupFile(path.join(buildDir, fileName)),
      fileName,
    })),
  );

  console.log(`🚦 CI-style build channel: ${channel}`);
  console.log(`🏷️  Desktop version: ${version}`);
  console.log(`🌱 Build env: ${envName ? `.env.${envName}` : 'current shell/default'}`);
  console.log(`🧩 Keep local changes: ${keepChanges ? 'yes' : 'no'}`);

  try {
    runCommand(`npm run workflow:set-desktop-version ${version} ${channel}`);
    runCommand('npm run desktop:package:app', { NODE_ENV: 'production', UPDATE_CHANNEL: channel });
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  } finally {
    if (!keepChanges) {
      await restoreFile(desktopPackageJsonPath, packageJsonBackup);
      await Promise.all(
        iconBackups.map(({ fileName, content }) =>
          restoreFile(path.join(buildDir, fileName), content),
        ),
      );
      console.log('🧹 Restored local desktop package metadata and icons.');
    }
  }
};

main();
