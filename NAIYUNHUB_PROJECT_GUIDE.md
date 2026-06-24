# NaiYunHub 项目说明文档

这份文档用于 NaiYunHub 项目本地开发、调试和交付前检查。仓库基于 LobeHub 二开，当前项目品牌、模型、登录、消息频道、桌面端和部署配置已按 NaiYunHub 私有化场景调整。

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
- 如果使用 Casdoor 登录，本地 Casdoor 回调地址需要配置为：

```text
http://127.0.0.1:3010/api/auth/callback/casdoor
```

## 环境文件

本地默认读取 `.env.development`。

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

注意：本地启动脚本会让终端里已有的环境变量优先生效。如果登录、数据库或模型配置看起来不对，先检查当前 shell：

```bash
echo $APP_URL
echo $DATABASE_URL
echo $REDIS_URL
echo $OPENROUTER_PROXY_URL
```

如果输出了旧值，先 `unset` 或重新打开终端，再启动服务。

## 安装依赖

```bash
pnpm install
```

桌面端依赖 Electron 原生依赖，首次安装后如遇依赖问题，可单独进入桌面端目录执行：

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
  192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17
```

### 启动 Redis

```bash
docker run -d \
  --name naiyun-redis \
  -p 6379:6379 \
  -v naiyun_redis_data:/data \
  192.168.1.211:5001/naiyun-registry/library/redis:7-alpine \
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

`bun run dev` 会同时启动 Next.js 服务和 SPA Vite 服务。平时本地联调优先用这个命令。

### 仅启动 Next.js

```bash
bun run dev:next
```

### 仅启动 SPA

```bash
bun run dev:spa
```

SPA 默认端口为 `9876`。这个模式适合只调前端，但 API 仍需要可访问的后端。

### Docker Compose 启动 Web

如果需要使用容器内 Web，而不是本地源码运行：

```bash
docker-compose/dev/setup.sh up --no-build
```

访问：

```text
http://127.0.0.1:3010
```

注意：容器 Web 和本地 `bun run dev` 都会使用 `3010`。两者不要同时启动。

查看状态：

```bash
docker-compose/dev/setup.sh ps
```

停止：

```bash
docker-compose/dev/setup.sh down
```

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

桌面端默认会连接本地 Web 服务。如果需要强制指定服务地址，可以在启动前设置：

```bash
OFFICIAL_CLOUD_SERVER=http://127.0.0.1:3010 pnpm dev:desktop
```

### 桌面端打包

桌面端打包配置位于 `apps/desktop`，使用 `electron-vite` 构建主进程和渲染层，再由 `electron-builder` 生成安装包。

打包前建议先确认桌面端依赖已经安装：

```bash
cd apps/desktop
pnpm install
```

### 桌面端连接的 Web/Server 地址

桌面客户端默认连接地址由两个变量控制：

```env
OFFICIAL_CLOUD_SERVER=https://chat.naiyun.com:10085
NEXT_PUBLIC_OFFICIAL_URL=https://chat.naiyun.com:10085
```

- `OFFICIAL_CLOUD_SERVER`：写入 Electron 主进程，控制登录、OIDC 和 API 代理连接的服务地址。
- `NEXT_PUBLIC_OFFICIAL_URL`：写入桌面渲染层，控制 UI 中 Cloud 模式、头像、站内链接等基准地址。

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

桌面安装包会在构建时把这些地址写入主进程和渲染层。推荐使用根目录的渠道打包入口，并通过 `--env` 指定环境文件，不再手动 `source`：

```bash
pnpm run desktop:build-channel -- <stable|beta|nightly|canary> [version] --env <development|test|prod>
```

环境文件对应关系：

```text
--env development -> .env.development
--env test        -> .env.test
--env prod        -> .env.prod
```

生产环境变量示例：

```text
https://chat.naiyun.com:10085
https://chat.naiyun.com:10085
```

注意：只改 `.env.prod` 不会自动影响已经打好的桌面安装包。桌面客户端地址会在构建时写入安装包，所以修改地址后需要重新打包。

注意：`.env.test` / `.env.prod` 里的 `DESKTOP_APP_VERSION` 不会被 `desktop:build-channel` 自动当作安装包版本号；不传版本时默认使用根目录 `package.json` 的版本。需要固定版本时，在渠道后面显式传版本号。

### 本机平台打包命令

推荐在对应系统上打对应安装包：

- macOS 包：在 macOS 上打。
- Windows 包：在 Windows 上打。
- Linux 包：在 Linux 上打。

跨系统打包会受到 `electron-builder`、代码签名、系统依赖和 Wine/Mono 等限制，不建议作为常规发布流程。

### 指定目标架构

桌面端提供明确的架构脚本，以下命令在 `apps/desktop` 目录执行：

```bash
pnpm run package:win:x64
pnpm run package:win:arm64
pnpm run package:linux:x64
pnpm run package:linux:arm64
```

注意：不要使用 `pnpm run package:win -- --x64`。在当前 pnpm 脚本里，多出来的 `--` 会让 `electron-builder` 不再解析后面的 `--x64`，结果仍可能按当前机器架构打包。

日常不要手写透传参数，直接使用 `package:win:x64` / `package:win:arm64` / `package:linux:x64` / `package:linux:arm64`。

常用架构：

```text
x64   -> 普通 Intel / AMD 64 位电脑，绝大多数 Windows 和 Linux 电脑使用这个
arm64 -> Apple Silicon、Windows ARM、Linux ARM64
ia32  -> 旧 32 位 Windows，不建议作为默认发布包
```

当前如果在 Mac M 系列机器上直接执行：

```bash
pnpm run package:win
```

`electron-builder` 会倾向于按当前机器架构生成 Windows ARM64 包。给普通 Windows 用户发包时，应显式指定 `x64`：

```bash
pnpm run package:win:x64
```

如果需要 Windows ARM64 包：

```bash
pnpm run package:win:arm64
```

Linux 同理：

```bash
pnpm run package:linux:x64
pnpm run package:linux:arm64
```

macOS 当前配置默认跟随构建机器架构：Apple Silicon 机器打 `arm64`，Intel Mac 打 `x64`。如果要稳定同时发布 macOS `x64` 和 `arm64`，建议在对应架构机器或 CI 上分别打包，或者后续调整 `apps/desktop/electron-builder.mjs` 的 `mac.target` 架构配置。

### macOS 安装包

测试环境 macOS 包从项目根目录执行：

```bash
cd /Users/zhaojuanchao/Workspace/Projects/Work/github/lobe-chat
rm -rf apps/desktop/release

pnpm run desktop:build-channel -- nightly --env test
```

如果要指定测试包版本号：

```bash
pnpm run desktop:build-channel -- nightly 2.2.4 --env test
```

正式 macOS 包从项目根目录执行：

```bash
cd /Users/zhaojuanchao/Workspace/Projects/Work/github/lobe-chat
rm -rf apps/desktop/release

pnpm run desktop:build-channel -- stable --env prod
```

如果要指定正式版本号：

```bash
pnpm run desktop:build-channel -- stable 2.2.4 --env prod
```

常见产物：

```text
apps/desktop/release/
```

安装包文件名由当前渠道、版本号、目标架构和 `apps/desktop/package.json` 的 `productName` 共同决定，以 `apps/desktop/release` 实际输出为准。

`pnpm run desktop:build-channel -- nightly --env test` 与 `pnpm run package:mac` 的区别：

- `desktop:build-channel` 是根目录封装入口，会读取 `.env.test` / `.env.prod`，设置渠道、版本、包名和图标，打完后恢复本地 `apps/desktop/package.json` 和图标文件。
- `package:mac` 是 `apps/desktop` 下的 Electron 底层打包命令，不会自动读取根目录 `.env.test`，也不会自动切换测试/正式渠道。

如果只需要临时本机底层打包，可以进入 `apps/desktop` 执行：

```bash
cd apps/desktop
pnpm run package:mac
```

正式发给真实用户时，建议配置 Apple Developer ID 签名和 notarization，否则用户安装时会遇到明显的安全拦截。

### Windows 安装包

普通 Windows Intel / AMD 电脑使用 `x64` 包。在 Windows 机器上执行：

```powershell
$env:OFFICIAL_CLOUD_SERVER="https://chat.naiyun.com:10085"
$env:NEXT_PUBLIC_OFFICIAL_URL="https://chat.naiyun.com:10085"

cd apps/desktop
pnpm run package:win:x64
```

推荐在 Windows x64 机器或 Windows x64 CI 上打 Windows x64 包。本项目桌面端包含 `get-windows`、`node-screenshots` 等原生模块，Mac M 系列机器交叉打 Windows x64 时可能报错：

```text
node-gyp does not support cross-compiling native modules from source
```

这不是服务地址或安装包命名问题，而是原生依赖不能从 macOS arm64 可靠交叉编译到 Windows x64。遇到这个错误时，把同一份代码放到 Windows x64 环境重新执行 `pnpm run package:win:x64`。

不建议在 Mac M 系列机器上交叉打 Windows x64 包；即使 Electron Builder 进入了 `arch=x64` 流程，也可能在原生模块重建阶段失败。Windows x64 包直接放到 Windows x64 环境打。

如果只是给 Windows ARM 设备使用：

```bash
pnpm run package:win:arm64
```

常见产物位于：

```text
apps/desktop/release/
```

当前 Windows 安装包文件名会带目标架构：

```text
apps/desktop/release/NaiYunHub-0.0.0-x64-setup.exe
apps/desktop/release/NaiYunHub-0.0.0-arm64-setup.exe
```

其中 `0.0.0` 来自 `apps/desktop/package.json` 的版本号，`x64` / `arm64` 来自打包目标架构。

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

常见产物位于：

```text
apps/desktop/release/
```

Linux 产物通常包含 AppImage 或对应平台包，具体取决于 `electron-builder.mjs` 配置和当前构建环境。

### 自动按当前系统打包

根目录提供了按当前操作系统选择打包命令的底层脚本：

```bash
pnpm run desktop:package:app
```

脚本会根据当前系统自动选择：

```text
macOS   -> apps/desktop package:mac
Windows -> apps/desktop package:win
Linux   -> apps/desktop package:linux
```

这个底层脚本不会自动选择 `.env.test` / `.env.prod`。测试环境和正式环境发布优先使用：

```bash
pnpm run desktop:build-channel -- nightly --env test
pnpm run desktop:build-channel -- stable --env prod
```

### 本地目录包

只生成未压缩的 app 目录，适合调试打包结构。这是底层调试命令，不支持 `--env test` / `--env prod`；如需指定环境，需要先把对应 `.env` 加载到当前终端。

从项目根目录执行：

```bash
set -a
source .env.prod
set +a

pnpm run desktop:package:local
```

如果已经进入 `apps/desktop`，使用桌面端自己的脚本：

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

进入 `apps/desktop` 后对应命令是：

```bash
pnpm run package:local:reuse
```

### 版本号和渠道

推荐使用根目录封装脚本一次完成“加载环境变量 + 设置版本 + 设置渠道 + 打包”：

```bash
pnpm run desktop:build-channel -- nightly --env test
pnpm run desktop:build-channel -- nightly 2.2.4 --env test
pnpm run desktop:build-channel -- stable --env prod
pnpm run desktop:build-channel -- stable 2.2.4 --env prod
```

可用渠道：

```text
stable
beta
nightly
canary
```

脚本完整语法：

```bash
pnpm run desktop:build-channel -- <stable|beta|nightly|canary> [version] --env <development|test|prod> [--keep-changes]
```

`--keep-changes` 会保留脚本改过的桌面版本号和图标文件；不加时脚本会在结束后恢复本地文件。

如果出现 `Missing script: "desktop:build-channel"`，通常是因为当前目录在 `apps/desktop`。该脚本位于项目根目录，需要先回到仓库根目录再执行。

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

示例：

```bash
pnpm run desktop:build-channel -- stable 2.2.4 --env prod
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

说明打包时没有正确加载生产环境变量，需要重新执行：

```bash
pnpm run desktop:build-channel -- stable 2.2.4 --env prod
```

### OIDC 回调要求

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

### 常用命令速查

根目录入口：

```bash
# 测试环境安装包
cd /Users/zhaojuanchao/Workspace/Projects/Work/github/lobe-chat
rm -rf apps/desktop/release
pnpm run desktop:build-channel -- nightly --env test

# 测试环境安装包，指定版本号
pnpm run desktop:build-channel -- nightly 2.2.4 --env test

# 正式环境安装包
rm -rf apps/desktop/release
pnpm run desktop:build-channel -- stable --env prod

# 正式环境安装包，指定版本号
pnpm run desktop:build-channel -- stable 2.2.4 --env prod

# 底层：自动按当前系统打安装包，不自动选择 .env.test / .env.prod
pnpm run desktop:package:app

# 底层：本地目录包，适合调试打包结构
pnpm run desktop:package:local
```

`apps/desktop` 目录入口：

```bash
# macOS 底层打包命令，不自动读取根目录 .env.test / .env.prod
cd apps/desktop
pnpm run package:mac

# Windows 正式包，PowerShell
$env:OFFICIAL_CLOUD_SERVER="https://chat.naiyun.com:10085"
$env:NEXT_PUBLIC_OFFICIAL_URL="https://chat.naiyun.com:10085"
cd apps/desktop
pnpm run package:win:x64

# Linux 正式包
export OFFICIAL_CLOUD_SERVER=https://chat.naiyun.com:10085
export NEXT_PUBLIC_OFFICIAL_URL=https://chat.naiyun.com:10085
cd apps/desktop
pnpm run package:linux:x64
```

注意：`pnpm run desktop:package:local` 是根目录脚本；如果当前目录已经是 `apps/desktop`，要执行 `pnpm run package:local`。

局域网测试包如果是当前系统安装包，推荐把 `.env.development` 里的地址改为当前机器 Web 服务，例如 `http://192.168.10.87:3010`，然后从项目根目录执行：

```bash
pnpm run desktop:build-channel -- nightly --env development
```

如果要打普通 Windows x64 局域网包，请在 Windows x64 环境执行底层命令，PowerShell 写法：

```powershell
cd apps/desktop

$env:OFFICIAL_CLOUD_SERVER="http://192.168.10.87:3010"
$env:NEXT_PUBLIC_OFFICIAL_URL="http://192.168.10.87:3010"

pnpm run package:win:x64
```

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

当前内网镜像源前缀为：

```text
192.168.1.211:5001/naiyun-registry/
```

Docker Hub 官方镜像需要走 `library/` 路径，例如：

```text
192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
```

第三方镜像保持原命名空间，例如：

```text
192.168.1.211:5001/naiyun-registry/searxng/searxng:latest
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
