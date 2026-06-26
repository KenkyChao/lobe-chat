# NaiYunHub 项目说明文档

本文用于 NaiYunHub 的本地开发、调试、桌面端打包、CLI 调试和交付前检查。仓库基于 LobeHub 二开，品牌、模型、登录、消息频道、桌面端和部署配置已按 NaiYunHub 私有化场景调整。

相关文档：

- 运维部署、Docker Compose 和容器排查：[NaiYunHub 运维部署手册.md](<NaiYunHub 运维部署手册.md>)

## 文档边界

| 文档                        | 主要内容                                                             |
| --------------------------- | -------------------------------------------------------------------- |
| 本文档                      | 项目结构、本地源码开发、桌面端打包、CLI 调试、提交前检查             |
| `NaiYunHub 运维部署手册.md` | Docker Compose、镜像构建、Harbor 推送、测试/生产服务器部署、容器排查 |

## 项目结构

```text
.
├── src/                  # Web SPA、页面、业务功能、客户端服务
├── apps/
│   ├── desktop/          # Electron 桌面端
│   ├── cli/              # NaiYunHub CLI
│   └── server/           # 服务端路由、服务、工作流
├── packages/             # 共享包、模型库、运行时、数据库、内置工具
├── docker-compose/       # 本地、生产、观测相关 compose 配置
├── docs/                 # 公开文档、开发文档、变更记录
├── .env.development      # 本地开发环境配置
├── .env.test             # 测试环境配置
└── .env.prod             # 生产环境配置
```

## 基础要求

- Node.js、Bun、pnpm。
- Docker Desktop 或兼容 Docker 环境。
- 本地源码启动 Web 时，需要 PostgreSQL 和 Redis 可用。
- 使用 Casdoor 登录时，本地 Casdoor 回调地址需要配置为：

```text
http://127.0.0.1:3010/api/auth/callback/casdoor
```

## 环境文件

本地默认读取 `.env.development`。测试和生产发布分别使用 `.env.test`、`.env.prod`。

常用关键项：

```env
APP_URL=http://127.0.0.1:3010
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres
REDIS_URL=redis://127.0.0.1:6379
AUTH_SSO_PROVIDERS=casdoor
AUTH_CASDOOR_ISSUER=...
AUTH_CASDOOR_ID=...
AUTH_CASDOOR_SECRET=...
OPENROUTER_API_KEY=...
OPENROUTER_PROXY_URL=...
SEARXNG_URL=http://127.0.0.1:8080
```

本地启动脚本会让当前终端中已有的环境变量优先生效。如果登录、数据库或模型配置看起来不对，先检查当前 shell：

```bash
echo $APP_URL
echo $DATABASE_URL
echo $REDIS_URL
echo $OPENROUTER_PROXY_URL
```

如果输出了旧值，先 `unset` 对应变量，或重新打开终端再启动服务。

## 安装依赖

```bash
pnpm install
```

桌面端依赖 Electron 原生依赖。首次安装后如遇依赖问题，可单独进入桌面端目录执行：

```bash
cd apps/desktop
pnpm install
```

## 本地依赖服务

本地源码启动 Web 时，推荐只单独启动 PostgreSQL 和 Redis，不启动 `lobe` 容器，避免和 `bun run dev` 同时占用 `3010`。

### 启动 PostgreSQL

```bash
docker run -d \
  --name naiyun-postgres \
  -p 5433:5432 \
  -e POSTGRES_DB=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v "$PWD/docker-compose/dev/data:/var/lib/postgresql/data" \
  paradedb/paradedb:latest-pg17
```

### 启动 Redis

```bash
docker run -d \
  --name naiyun-redis \
  -p 6379:6379 \
  -v naiyun_redis_data:/data \
  redis:7-alpine \
  redis-server --save 60 1000 --appendonly yes
```

如果容器已经存在，只是停止了：

```bash
docker start naiyun-postgres naiyun-redis
```

验证：

```bash
redis-cli -p 6379 ping
pg_isready -h 127.0.0.1 -p 5433 -U postgres
```

预期结果：

```text
PONG
accepting connections
```

首次初始化或数据库结构变更后，执行迁移：

```bash
bun run db:migrate
```

## 启动 Web

### 全栈本地开发

```bash
bun run dev
```

默认访问：

```text
http://127.0.0.1:3010
```

`bun run dev` 会同时启动 Next.js 服务和 SPA Vite 服务。平时本地联调优先使用这个命令。

### 仅启动 Next.js

```bash
bun run dev:next
```

### 仅启动 SPA

```bash
bun run dev:spa
```

SPA 默认端口为 `9876`。这个模式适合只调前端，但 API 仍需要可访问的后端。

### 使用 Docker Compose 启动 Web

如果需要使用容器内 Web，而不是本地源码运行：

```bash
docker-compose/dev/setup.sh up --no-build
```

访问：

```text
http://127.0.0.1:3010
```

容器 Web 和本地 `bun run dev` 都会使用 `3010`，不要同时启动。更多 compose 启动和排查命令见 [NaiYunHub 运维部署手册.md](<NaiYunHub 运维部署手册.md>)。

## 启动桌面端

桌面端在 `apps/desktop`，基于 Electron。

先确保本地 Web 已经启动：

```text
http://127.0.0.1:3010
```

然后启动桌面端：

```bash
pnpm dev:desktop
```

等价命令：

```bash
cd apps/desktop
pnpm run dev
```

桌面端默认会连接本地 Web 服务。如需强制指定服务地址：

```bash
OFFICIAL_CLOUD_SERVER=http://127.0.0.1:3010 pnpm dev:desktop
```

## 桌面端打包

桌面端打包配置位于 `apps/desktop`。构建流程先使用 `electron-vite` 构建主进程和渲染层，再由 `electron-builder` 生成安装包。

### 服务地址

桌面客户端默认连接地址由两个变量控制：

```env
OFFICIAL_CLOUD_SERVER=https://chat.naiyun.com:10085
NEXT_PUBLIC_OFFICIAL_URL=https://chat.naiyun.com:10085
```

| 变量                       | 用途                                                            |
| -------------------------- | --------------------------------------------------------------- |
| `OFFICIAL_CLOUD_SERVER`    | 写入 Electron 主进程，控制登录、OIDC 和 API 代理连接的服务地址  |
| `NEXT_PUBLIC_OFFICIAL_URL` | 写入桌面渲染层，控制 UI 中 Cloud 模式、头像、站内链接等基准地址 |

本地开发使用 `.env.development`：

```env
OFFICIAL_CLOUD_SERVER=http://127.0.0.1:3010
NEXT_PUBLIC_OFFICIAL_URL=http://127.0.0.1:3010
```

生产发布使用 `.env.prod`：

```env
OFFICIAL_CLOUD_SERVER=https://chat.naiyun.com:10085
NEXT_PUBLIC_OFFICIAL_URL=https://chat.naiyun.com:10085
```

桌面安装包会在构建时把这些地址写入主进程和渲染层。修改地址后必须重新打包；只改 `.env.prod` 不会影响已经生成的安装包。

### 推荐入口

推荐使用根目录的渠道打包入口：

```bash
pnpm run desktop:build-channel -- <stable|beta|nightly|canary> [version] --env <development|test|prod>
```

环境文件对应关系：

```text
--env development -> .env.development
--env test        -> .env.test
--env prod        -> .env.prod
```

示例：

```bash
pnpm run desktop:build-channel -- nightly --env test
pnpm run desktop:build-channel -- nightly 2.2.4 --env test
pnpm run desktop:build-channel -- stable --env prod
pnpm run desktop:build-channel -- stable 2.2.4 --env prod
```

`.env.test` / `.env.prod` 里的 `DESKTOP_APP_VERSION` 不会被 `desktop:build-channel` 自动当作安装包版本号。不传版本时默认使用根目录 `package.json` 的版本；需要固定版本时，在渠道后面显式传版本号。

`--keep-changes` 会保留脚本改过的桌面版本号和图标文件；不加时脚本会在结束后恢复本地文件。

如果出现 `Missing script: "desktop:build-channel"`，通常是因为当前目录在 `apps/desktop`。该脚本位于项目根目录，需要先回到仓库根目录再执行。

### 架构和平台

推荐在对应系统上打对应安装包：

- macOS 包：在 macOS 上打。
- Windows 包：在 Windows 上打。
- Linux 包：在 Linux 上打。

跨系统打包会受到 `electron-builder`、代码签名、系统依赖和 Wine/Mono 等限制，不建议作为常规发布流程。

常用架构：

```text
x64   -> 普通 Intel / AMD 64 位电脑，绝大多数 Windows 和 Linux 电脑使用这个
arm64 -> Apple Silicon、Windows ARM、Linux ARM64
ia32  -> 旧 32 位 Windows，不建议作为默认发布包
```

桌面端提供明确的架构脚本，以下命令在 `apps/desktop` 目录执行：

```bash
pnpm run package:win:x64
pnpm run package:win:arm64
pnpm run package:linux:x64
pnpm run package:linux:arm64
```

不要使用 `pnpm run package:win -- --x64`。在当前 pnpm 脚本里，多出来的 `--` 会让 `electron-builder` 不再解析后面的 `--x64`，结果仍可能按当前机器架构打包。

macOS 当前配置默认跟随构建机器架构：Apple Silicon 机器打 `arm64`，Intel Mac 打 `x64`。如果要稳定同时发布 macOS `x64` 和 `arm64`，建议在对应架构机器或 CI 上分别打包。

### macOS 安装包

测试环境 macOS 包从项目根目录执行：

```bash
rm -rf apps/desktop/release
pnpm run desktop:build-channel -- nightly --env test
```

正式 macOS 包从项目根目录执行：

```bash
rm -rf apps/desktop/release
pnpm run desktop:build-channel -- stable --env prod
```

常见产物位于：

```text
apps/desktop/release/
```

`desktop:build-channel` 和 `package:mac` 的区别：

- `desktop:build-channel` 是根目录封装入口，会读取 `.env.test` / `.env.prod`，设置渠道、版本、包名和图标，结束后恢复本地 `apps/desktop/package.json` 和图标文件。
- `package:mac` 是 `apps/desktop` 下的 Electron 底层打包命令，不会自动读取根目录 `.env.test`，也不会自动切换测试/正式渠道。

如只需要临时本机底层打包：

```bash
cd apps/desktop
pnpm run package:mac
```

正式发给真实用户时，建议配置 Apple Developer ID 签名和 notarization，否则用户安装时会遇到明显的系统安全拦截。

### macOS 签名与公证

当前桌面端打包配置读取以下变量：

```text
CSC_LINK
CSC_NAME
CSC_KEY_PASSWORD
APPLE_API_KEY
APPLE_API_KEY_ID
APPLE_API_ISSUER
```

变量含义：

| 变量                                                      | 用途                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `CSC_LINK` / `CSC_KEY_PASSWORD`                           | Developer ID Application 证书导出的 `.p12` 文件和导出密码，用于 macOS 应用签名 |
| `CSC_NAME`                                                | 本机登录钥匙串里的 Developer ID Application 签名身份名称，可替代 `.p12` 导入   |
| `APPLE_API_KEY` / `APPLE_API_KEY_ID` / `APPLE_API_ISSUER` | App Store Connect API 团队密钥 `.p8`、Key ID、Issuer ID，用于 notarization     |

在打包机的项目根目录创建本地文件：

```bash
.env.signing.local
```

该文件已被 `.gitignore` 的 `.env*.local` 规则忽略，只能保存在打包机本地，不要提交仓库，也不要上传服务器。

内容示例：

```bash
export CSC_LINK="$HOME/.apple-certs/DeveloperIDApplication.p12"
export CSC_KEY_PASSWORD="p12导出密码"

export APPLE_API_KEY="$HOME/.apple-certs/AuthKey_XXXXXX.p8"
export APPLE_API_KEY_ID="XXXXXX"
export APPLE_API_ISSUER="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

如果本机已经能通过 `security find-identity -v -p codesigning` 查到 Developer ID 身份，也可以使用钥匙串身份模式：

```bash
unset CSC_LINK
export CSC_NAME="公司名 (TEAMID)"

export APPLE_API_KEY="$HOME/.apple-certs/AuthKey_XXXXXX.p8"
export APPLE_API_KEY_ID="XXXXXX"
export APPLE_API_ISSUER="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

每次正式 macOS 打包前，先在项目根目录加载：

```bash
source .env.signing.local
```

检查变量和文件是否存在：

```bash
test -r "$CSC_LINK" && echo "p12 文件可读取"
test -r "$APPLE_API_KEY" && echo "p8 文件可读取"
```

验证 `.p12` 密码是否正确：

```bash
openssl pkcs12 -legacy -in "$CSC_LINK" -nokeys -passin "pass:$CSC_KEY_PASSWORD" \
  | openssl x509 -noout -subject -issuer -dates
```

生产环境正式包：

```bash
source .env.signing.local
pnpm run desktop:build-channel -- stable 2.2.4 --env prod
```

测试环境包：

```bash
source .env.signing.local
pnpm run desktop:build-channel -- nightly 2.2.4 --env test
```

签名变量未生效时，打包日志通常会出现：

```text
Apple certificate link not found
skipped macOS code signing
identity explicitly is set to null
```

签名变量生效后，日志中应能看到类似：

```text
signing
notarizing
```

打包完成后验证 DMG：

```bash
spctl -a -vvv -t install apps/desktop/release/NaiYunHub-2.2.4-arm64.dmg
xcrun stapler validate apps/desktop/release/NaiYunHub-2.2.4-arm64.dmg
```

期望结果：

```text
spctl 显示 accepted
stapler validate 显示可验证或 accepted
```

常见问题：

- `CSC_LINK` 不能指向 `.p8` 文件。`.p8` 只能用于 `APPLE_API_KEY`。
- 如果钥匙串里看不到 `Developer ID Application: 公司名 (TEAMID)`，说明当前 Mac 还没有安装签名证书，或证书缺少私钥。
- 如果 `security find-identity -v -p codesigning` 显示 `0 valid identities found`，先确认 Apple Developer ID G2 中间证书已安装。
- 如果验证 `.p12` 时出现 `Algorithm (RC2-40-CBC : 0) unsupported`，先用 `openssl pkcs12 -legacy` 验证；如果 `electron-builder` 仍无法导入，可重新导出为 macOS `security` 更兼容的 3DES/SHA1 格式。

### Windows 安装包

普通 Windows Intel / AMD 电脑使用 `x64` 包。推荐在 Windows x64 机器或 Windows x64 CI 上执行：

```powershell
$env:OFFICIAL_CLOUD_SERVER="https://chat.naiyun.com:10085"
$env:NEXT_PUBLIC_OFFICIAL_URL="https://chat.naiyun.com:10085"

cd apps/desktop
pnpm run package:win:x64
```

本项目桌面端包含 `get-windows`、`node-screenshots` 等原生模块。Mac M 系列机器交叉打 Windows x64 时可能报错：

```text
node-gyp does not support cross-compiling native modules from source
```

遇到这个错误时，把同一份代码放到 Windows x64 环境重新执行 `pnpm run package:win:x64`。

Windows ARM 设备使用：

```bash
pnpm run package:win:arm64
```

### Linux 安装包

在 Linux 机器上执行：

```bash
export OFFICIAL_CLOUD_SERVER=https://chat.naiyun.com:10085
export NEXT_PUBLIC_OFFICIAL_URL=https://chat.naiyun.com:10085

cd apps/desktop
pnpm run package:linux:x64
```

如果目标是 Linux ARM64：

```bash
pnpm run package:linux:arm64
```

Linux 产物通常包含 AppImage 或对应平台包，具体取决于 `apps/desktop/electron-builder.mjs` 配置和当前构建环境。

### 本地目录包

只生成未压缩的 app 目录，适合调试打包结构。这是底层调试命令，不支持 `--env test` / `--env prod`；如需指定环境，需要先把对应 `.env` 加载到当前终端。

从项目根目录执行：

```bash
set -a
source .env.prod
set +a

pnpm run desktop:package:local
```

如果已经进入 `apps/desktop`：

```bash
set -a
source ../../.env.prod
set +a

pnpm run package:local
```

如果只是复用上次 `build:main` 产物重新打目录包：

```bash
pnpm run desktop:package:local:reuse
```

### 更新源

如果暂时不启用自动更新，不配置 `UPDATE_SERVER_URL` 即可。当前构建逻辑会禁用官方更新源，避免自定义包检查 LobeHub 官方更新。

配置自己的更新源：

```bash
export UPDATE_SERVER_URL=https://chat.naiyun.com:10085/naiyun-chat/desktop-updates
```

打包时会按渠道自动拼接：

```text
stable  -> $UPDATE_SERVER_URL/stable
nightly -> $UPDATE_SERVER_URL/nightly
canary  -> $UPDATE_SERVER_URL/canary
beta    -> $UPDATE_SERVER_URL/beta
```

### 打包后验证

检查安装包是否写入生产服务地址：

```bash
rg "chat.naiyun.com:10085|127.0.0.1:3010" apps/desktop/dist apps/desktop/release
```

生产包应出现：

```text
https://chat.naiyun.com:10085
```

如果仍主要出现：

```text
http://127.0.0.1:3010
```

说明打包时没有正确加载生产环境变量，需要重新打包。

生产 Web/Server 的 `.env.prod` 也需要保持：

```env
APP_URL=https://chat.naiyun.com:10085
```

桌面登录会使用：

```text
https://chat.naiyun.com:10085/oidc/auth
https://chat.naiyun.com:10085/oidc/callback/desktop
```

如果登录页提示 `invalid_redirect_uri`，优先检查服务端 `APP_URL` 是否等于桌面包里的 `OFFICIAL_CLOUD_SERVER`。

## 启动 CLI

CLI 位于 `apps/cli`，命令入口为 `lh`，同时兼容历史命令 `lobe`、`lobehub`。

### 开发方式运行

```bash
cd apps/cli
LOBEHUB_SERVER=http://127.0.0.1:3010 bun src/index.ts --help
```

登录本地服务：

```bash
cd apps/cli
LOBEHUB_SERVER=http://127.0.0.1:3010 bun src/index.ts login --server http://127.0.0.1:3010
```

登录后查看当前用户：

```bash
cd apps/cli
LOBEHUB_SERVER=http://127.0.0.1:3010 bun src/index.ts whoami
```

也可以使用 API Key：

```bash
export LOBEHUB_SERVER=http://127.0.0.1:3010
export LOBEHUB_CLI_API_KEY=你的_API_Key
cd apps/cli
bun src/index.ts whoami
```

CLI 默认把凭据存储在用户目录下的 `.lobehub`。开发时如果想隔离本地凭据：

```bash
cd apps/cli
LOBEHUB_CLI_HOME=.lobehub-dev LOBEHUB_SERVER=http://127.0.0.1:3010 bun src/index.ts whoami
```

### 构建和本地链接

```bash
cd apps/cli
pnpm run build
pnpm run cli:link
```

链接后可以直接运行：

```bash
lh --help
lh login --server http://127.0.0.1:3010
lh whoami
```

取消链接：

```bash
cd apps/cli
pnpm run cli:unlink
```

## 常用检查

### 登录失败

如果页面提示“登录遇到了问题，请重试”，优先检查：

```bash
redis-cli -p 6379 ping
pg_isready -h 127.0.0.1 -p 5433 -U postgres
```

Better Auth 会使用 Redis 存储 OAuth 临时状态。只要 `.env.development` 配置了 `REDIS_URL`，Redis 停掉就可能导致登录失败。

同时检查 Casdoor issuer：

```bash
node -e "fetch('https://chat.naiyun.com:10087/.well-known/openid-configuration').then(r=>console.log(r.status)).catch(console.error)"
```

### 端口冲突

```bash
lsof -i :3010
lsof -i :5433
lsof -i :6379
```

`3010` 是 Web 访问端口，`5433` 是本地 PostgreSQL 映射端口，`6379` 是 Redis 端口。

### 数据库迁移

```bash
bun run db:migrate
```

如果数据库结构变更后页面异常，先确认迁移是否执行。

### Docker 镜像

公司内网服务器不直接访问 Docker Hub。标准流程是：开发主机自行从 Docker Hub 公网拉取所需镜像，手动 `tag` 后推送到 Harbor；测试/生产服务器只从 Harbor 拉取镜像。

业务镜像推送到 Harbor 的 `naiyun-chat` 项目：

```text
192.168.1.211:5001/naiyun-chat/naiyunchat-db:<version>
```

Docker Hub 公共基础镜像推送到 Harbor 的 `naiyun-registry` 项目，当前前缀为：

```text
192.168.1.211:5001/naiyun-registry/
```

Docker Hub 官方镜像推送到 Harbor 时需要走 `library/` 路径，例如：

```text
192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
```

第三方镜像推送到 Harbor 时保持原命名空间，例如：

```text
192.168.1.211:5001/naiyun-registry/searxng/searxng:latest
```

目标服务器拉取 Harbor 镜像后，如 compose 仍使用 Docker Hub 原始镜像名，需要在目标服务器本地再 `tag` 回原名，例如：

```bash
docker pull 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
docker tag 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine redis:7-alpine
```

## 推荐日常流程

1. 启动本地依赖：

```bash
docker start naiyun-postgres naiyun-redis
```

2. 启动 Web：

```bash
bun run dev
```

3. 启动桌面端：

```bash
pnpm dev:desktop
```

4. 调试 CLI：

```bash
cd apps/cli
LOBEHUB_SERVER=http://127.0.0.1:3010 bun src/index.ts --help
```

## 提交前建议

按改动范围选择运行：

```bash
bun run type-check
```

针对单个测试文件：

```bash
bunx vitest run --silent='passed-only' path/to/file.test.ts
```

不要默认运行完整 `bun run test`，耗时较长。
