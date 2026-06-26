# NaiYunHub 运维部署手册

本文用于 NaiYunHub 的 Docker Compose 环境、测试/生产服务器部署、Harbor 镜像发布和容器排障。当前部署方式以 `docker-compose/dev/docker-compose.yml` 为主：开发主机从 Docker Hub 公网拉取公共基础镜像，手动推送到公司内网 Harbor；开发主机构建业务镜像并推送到 Harbor 的 `naiyun-chat` 项目；测试/生产服务器只从 Harbor 拉取镜像，不直连 Docker Hub，拉取后 tag 成 compose 需要的本地镜像名，最后通过 `--no-build` 启动。

相关文档：

- 项目结构、本地开发、桌面端和 CLI：[NaiYunHub 项目说明文档.md](<NaiYunHub 项目说明文档.md>)

## 文档边界

本文只保留运维部署相关内容：

- `docker-compose/` 目录职责、环境变量、端口和容器排查。
- 开发主机拉取 Docker Hub 公共镜像、推送 Harbor，本地构建业务镜像并推送 Harbor，目标服务器只从 Harbor 拉取并启动。
- 测试环境、生产环境的停止、重启、日志和常见问题。
- 微信 / Bot Gateway、S3、登录回调、镜像缺失、端口冲突等排障。

桌面端 macOS 签名、公证、Windows/Linux 安装包打包已收敛到 [NaiYunHub 项目说明文档.md](<NaiYunHub 项目说明文档.md>)，避免签名变量和打包命令在多处重复维护。

## Docker Compose 目录职责

| 目录                  | 用途                                              | 业务镜像                                | 依赖服务                                                                                      | 适用场景                                                   |
| --------------------- | ------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `dev/`                | 本地源码镜像验证环境，也可承载测试/生产服务器启动 | `naiyunchat-db:${package.json.version}` | 内置 PostgreSQL / Redis / SearXNG，外接 MinIO / Casdoor                                       | 本地私有化联调、验证当前代码镜像、服务器复用已构建镜像启动 |
| `production/grafana/` | 带观测组件的生产模板                              | `naiyunchat-db:${package.json.version}` | 内置 PostgreSQL / Redis / SearXNG / Grafana / Tempo / Prometheus / OTel，外接 MinIO / Casdoor | 后续生产观测链路验证                                       |

当前主要使用 `docker-compose/dev/` 做本地源码镜像验证；测试/生产服务器也复用该 compose，通过 `--env test` 或 `--env prod` 切换根目录环境文件。

## 前置要求与版本

本机或服务器需要安装：

```bash
docker version
docker compose version
```

本地源码镜像验证还需要：

```bash
node --version
```

业务镜像版本来自根目录 `package.json`：

```bash
VERSION="$(node -p "require('./package.json').version")"
IMAGE="naiyunchat-db:${VERSION}"

echo "$IMAGE"
```

当前版本示例：

```text
naiyunchat-db:2.2.4
```

后续命令里的 `2.2.4` 都应替换为当前 `package.json` 版本。

`dev/setup.sh` 会从项目根目录 `package.json` 读取版本号，并使用该版本构建或启动：

```text
naiyunchat-db:${package.json.version}
```

## dev Compose 架构

`docker-compose/dev/docker-compose.yml` 的设计目标：

- `network-service` 使用 `alpine`，统一暴露 Web 端口。
- `lobe` 使用本地源码构建出的 `naiyunchat-db:${package.json.version}`。
- `lobe` 不允许拉取云端业务镜像，配置了 `pull_policy: never`。
- PostgreSQL 使用 `paradedb/paradedb:latest-pg17`。
- Redis 使用 `redis:7-alpine`。
- SearXNG 使用 `searxng/searxng`。
- MinIO / Casdoor 不在本地容器中启动，连接信息从所选根目录 env 文件读取。

服务网络采用共享 network namespace：

```text
lobe / postgresql / redis / searxng
  -> network_mode: service:network-service
```

因此容器内部连接地址使用：

```text
PostgreSQL: 127.0.0.1:5432
Redis:      127.0.0.1:6379
SearXNG:    127.0.0.1:8080
Lobe Web:   127.0.0.1:3210
```

宿主机访问地址默认是：

```text
http://127.0.0.1:3010
```

对应端口映射：

```text
宿主机 3010 -> 容器内 3210
```

## 环境变量来源

`dev` 环境默认读取项目根目录：

```text
.env.development
```

也可以通过 `--env` 选择其他根目录环境文件：

```bash
docker-compose/dev/setup.sh up --env development
docker-compose/dev/setup.sh up --env test
docker-compose/dev/setup.sh up --env prod
```

对应关系：

| 参数                | 实际文件           |
| ------------------- | ------------------ |
| `--env development` | `.env.development` |
| `--env test`        | `.env.test`        |
| `--env prod`        | `.env.prod`        |

也可以通过环境变量选择：

```bash
NAIYUN_ENV=prod docker-compose/dev/setup.sh up --no-build
```

关键变量：

| 类型         | 变量                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| 应用地址     | `APP_URL`                                                                                      |
| 内部调用地址 | `INTERNAL_APP_URL`，由 compose 注入为 `http://127.0.0.1:3210`                                  |
| 认证密钥     | `AUTH_SECRET`                                                                                  |
| Casdoor      | `AUTH_CASDOOR_ISSUER` / `AUTH_CASDOOR_ID` / `AUTH_CASDOOR_SECRET`                              |
| S3 / MinIO   | `S3_ENDPOINT` / `S3_PUBLIC_DOMAIN` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` |
| 桌面端地址   | `OFFICIAL_CLOUD_SERVER` / `NEXT_PUBLIC_OFFICIAL_URL`                                           |
| 数据库       | compose 覆盖为内部 PostgreSQL                                                                  |
| Redis        | compose 覆盖为内部 Redis                                                                       |
| 搜索         | compose 覆盖为内部 SearXNG                                                                     |

不要保留这些 LobeChat 2.0 已废弃变量，否则容器会启动失败：

```text
ACCESS_CODE
NEXT_AUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_SERVICE_MODE
```

如果旧配置里存在 `NEXT_AUTH_SECRET`，应迁移为：

```text
AUTH_SECRET=<原 NEXT_AUTH_SECRET 的值>
```

## 本地 Compose 验证

从项目根目录执行：

```bash
docker-compose/dev/setup.sh
```

这会执行：

1. 检查 Docker / Compose。
2. 读取 `package.json` 版本。
3. 检查所选根目录 env 文件的必要变量。
4. 构建本地业务镜像 `naiyunchat-db:<version>`。
5. 校验 compose 配置。
6. 启动 `network-service`、`postgresql`、`redis`、`searxng`、`lobe`。

启动后访问：

```text
http://127.0.0.1:3010
```

如果本地已经存在目标镜像，只想用现有镜像启动：

```bash
docker-compose/dev/setup.sh up --no-build
```

启动后跟随日志：

```bash
docker-compose/dev/setup.sh up --no-build --logs
```

如果只改了环境变量文件，需要重建容器读取新环境变量，但不重新打镜像：

```bash
docker-compose/dev/setup.sh restart --no-build
docker-compose/dev/setup.sh restart --env prod --no-build
```

## 常用 Compose 命令

```bash
# 预检 compose 配置，不启动容器
docker-compose/dev/setup.sh config

# 只构建本地业务镜像
docker-compose/dev/setup.sh build

# 指定目标架构构建
docker-compose/dev/setup.sh build --platform amd64

# 使用国内镜像源构建
docker-compose/dev/setup.sh build --use-cn-mirror

# 拉取基础服务镜像
docker-compose/dev/setup.sh pull

# 启动，并拉取基础镜像
docker-compose/dev/setup.sh up --pull-base

# 查看服务状态
docker-compose/dev/setup.sh status

# 查看 lobe 日志
docker-compose/dev/setup.sh logs

# 停止并移除容器，保留数据
docker-compose/dev/setup.sh down
```

等价原生命令：

```bash
docker compose --env-file .env.development -f docker-compose/dev/docker-compose.yml config
docker compose --env-file .env.development -f docker-compose/dev/docker-compose.yml up -d
docker compose --env-file .env.development -f docker-compose/dev/docker-compose.yml down
```

## 目标服务器必须存在的镜像

目标 Linux 服务器启动前需要具备：

```text
naiyunchat-db:<package.version>
alpine:latest
paradedb/paradedb:latest-pg17
redis:7-alpine
searxng/searxng:latest
```

检查：

```bash
docker image inspect \
  naiyunchat-db:2.2.4 \
  alpine:latest \
  paradedb/paradedb:latest-pg17 \
  redis:7-alpine \
  searxng/searxng:latest
```

业务镜像从 Harbor 拉取后，需要 tag 成 compose 文件要求的本地名称：

```bash
docker pull 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4
docker tag 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4 naiyunchat-db:2.2.4
```

公共基础镜像也必须从 Harbor 拉取，不在目标服务器直连 Docker Hub：

```bash
docker pull 192.168.1.211:5001/naiyun-registry/library/alpine:latest
docker tag 192.168.1.211:5001/naiyun-registry/library/alpine:latest alpine:latest

docker pull 192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17
docker tag 192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17 paradedb/paradedb:latest-pg17

docker pull 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
docker tag 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine redis:7-alpine

docker pull 192.168.1.211:5001/naiyun-registry/searxng/searxng:latest
docker tag 192.168.1.211:5001/naiyun-registry/searxng/searxng:latest searxng/searxng:latest
```

## 需要上传到服务器的文件

保持项目目录结构上传以下文件：

```text
package.json
.env.test
.env.prod
docker-compose/dev/setup.sh
docker-compose/dev/docker-compose.yml
docker-compose/dev/searxng-settings.yml
```

说明：

```text
.env.test  测试环境配置
.env.prod  生产环境配置
```

如果只部署测试环境，可以只上传 `.env.test`；如果只部署生产环境，可以只上传 `.env.prod`。

## 开发主机构建并推送到 Harbor

开发主机需要能访问 Docker Hub 公网和公司内网 Harbor。公司测试/生产服务器不直连 Docker Hub，所有 Docker Hub 公共镜像都由开发主机拉取后手动推送到 Harbor。

如果开发主机是 Mac，并且目标 Linux 服务器是 x86 架构，建议显式构建 `linux/amd64` 镜像。

### 准备 Dockerfile 基础镜像

当前 Dockerfile 使用的基础镜像是：

```text
node:24-slim
busybox:latest
```

在开发主机上从 Docker Hub 公网拉取目标平台基础镜像：

```bash
docker pull --platform linux/amd64 node:24-slim
docker pull --platform linux/amd64 busybox:latest
```

手动推送到 Harbor 的 `naiyun-registry` 项目，便于内网环境留档和复用：

```bash
docker login 192.168.1.211:5001

docker tag node:24-slim 192.168.1.211:5001/naiyun-registry/library/node:24-slim
docker tag busybox:latest 192.168.1.211:5001/naiyun-registry/library/busybox:latest

docker push 192.168.1.211:5001/naiyun-registry/library/node:24-slim
docker push 192.168.1.211:5001/naiyun-registry/library/busybox:latest
```

检查基础镜像架构：

```bash
docker image inspect node:24-slim --format '{{.Os}}/{{.Architecture}}'
docker image inspect busybox:latest --format '{{.Os}}/{{.Architecture}}'
```

期望输出：

```text
linux/amd64
```

### 构建业务镜像

测试环境构建：

```bash
docker-compose/dev/setup.sh build --env test --platform amd64
```

如果生产环境构建时需要读取 `.env.prod` 中的前端构建参数：

```bash
docker-compose/dev/setup.sh build --env prod --platform amd64
```

检查业务镜像架构：

```bash
docker image inspect naiyunchat-db:2.2.4 --format '{{.Os}}/{{.Architecture}}'
```

期望输出：

```text
linux/amd64
```

### tag 并推送业务镜像

登录 Harbor：

```bash
docker login 192.168.1.211:5001
```

将本地业务镜像 tag 到公司内网 Harbor 的 `naiyun-chat` 项目：

```bash
docker tag naiyunchat-db:2.2.4 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4
```

推送业务镜像：

```bash
docker push 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4
```

### 准备 compose 运行所需基础服务镜像

当前 compose 运行依赖以下基础服务镜像：

```text
alpine:latest
paradedb/paradedb:latest-pg17
redis:7-alpine
searxng/searxng:latest
```

在开发主机上提前从 Docker Hub 公网拉取目标平台镜像：

```bash
docker pull --platform linux/amd64 alpine:latest
docker pull --platform linux/amd64 paradedb/paradedb:latest-pg17
docker pull --platform linux/amd64 redis:7-alpine
docker pull --platform linux/amd64 searxng/searxng:latest
```

手动推送到 Harbor 的 `naiyun-registry` 项目。Docker Hub 官方镜像使用 `library/` 路径，第三方镜像保持原命名空间：

```bash
docker login 192.168.1.211:5001

docker tag alpine:latest 192.168.1.211:5001/naiyun-registry/library/alpine:latest
docker tag paradedb/paradedb:latest-pg17 192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17
docker tag redis:7-alpine 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
docker tag searxng/searxng:latest 192.168.1.211:5001/naiyun-registry/searxng/searxng:latest

docker push 192.168.1.211:5001/naiyun-registry/library/alpine:latest
docker push 192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17
docker push 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
docker push 192.168.1.211:5001/naiyun-registry/searxng/searxng:latest
```

## 上传部署文件

业务镜像和基础服务镜像已经推送到 Harbor 后，目标服务器只需要部署文件：

```bash
ssh root@服务器IP 'mkdir -p /opt/naiyunhub'
scp package.json .env.test .env.prod root@服务器IP:/opt/naiyunhub/
scp -r docker-compose root@服务器IP:/opt/naiyunhub/
```

## 目标服务器拉取、tag 并启动

进入部署目录：

```bash
cd /opt/naiyunhub
chmod +x docker-compose/dev/setup.sh
```

从 Harbor 拉取业务镜像，并 tag 成 compose 需要的本地镜像名：

```bash
docker login 192.168.1.211:5001
docker pull 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4
docker tag 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4 naiyunchat-db:2.2.4
```

基础服务镜像必须从 Harbor 的 `naiyun-registry` 项目拉取，并 tag 回 compose 使用的官方镜像名：

```bash
docker pull 192.168.1.211:5001/naiyun-registry/library/alpine:latest
docker tag 192.168.1.211:5001/naiyun-registry/library/alpine:latest alpine:latest

docker pull 192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17
docker tag 192.168.1.211:5001/naiyun-registry/paradedb/paradedb:latest-pg17 paradedb/paradedb:latest-pg17

docker pull 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine
docker tag 192.168.1.211:5001/naiyun-registry/library/redis:7-alpine redis:7-alpine

docker pull 192.168.1.211:5001/naiyun-registry/searxng/searxng:latest
docker tag 192.168.1.211:5001/naiyun-registry/searxng/searxng:latest searxng/searxng:latest
```

检查本地镜像是否齐全：

```bash
docker image inspect \
  naiyunchat-db:2.2.4 \
  alpine:latest \
  paradedb/paradedb:latest-pg17 \
  redis:7-alpine \
  searxng/searxng:latest
```

## 测试环境启动

```bash
docker-compose/dev/setup.sh config --env test
docker-compose/dev/setup.sh up --env test --no-build
docker-compose/dev/setup.sh status --env test
docker-compose/dev/setup.sh logs --env test
```

默认访问：

```text
http://服务器IP:3010
```

## 生产环境启动

```bash
docker-compose/dev/setup.sh config --env prod
docker-compose/dev/setup.sh up --env prod --no-build
docker-compose/dev/setup.sh status --env prod
docker-compose/dev/setup.sh logs --env prod
```

默认访问：

```text
http://服务器IP:3010
```

## 停止与重启

停止并保留数据卷：

```bash
docker-compose/dev/setup.sh down --env test
docker-compose/dev/setup.sh down --env prod
```

重启并复用已有镜像：

```bash
docker-compose/dev/setup.sh restart --env test --no-build
docker-compose/dev/setup.sh restart --env prod --no-build
```

## 关键配置说明

当前 `lobe` 服务使用：

```yaml
image: naiyunchat-db:${NAIYUNCHAT_DB_VERSION:-2.2.4}
pull_policy: never
```

含义：

```text
不从远端拉业务镜像，只使用目标服务器本地已有的 naiyunchat-db:2.2.4
```

所以使用 `--no-build` 启动前，必须确保目标服务器已有：

```text
naiyunchat-db:2.2.4
```

容器内 webhook 自调用地址由 compose 注入为：

```text
INTERNAL_APP_URL=http://127.0.0.1:3210
```

不要把它改成宿主机端口。

## 微信 / Bot Gateway 容器部署说明

微信使用长轮询模式。页面上显示“已连接”，只代表授权和通道配置存在，不代表消息一定能被 Gateway 正常转发。

消息链路大致如下：

```text
WeChat
  -> WeChat iLink polling
  -> lobehub 容器内 Gateway
  -> Lobe webhook: /api/agent/webhooks/wechat/:applicationId
  -> Agent / Model Runtime
  -> WeChat sendMessage
```

在 Docker dev 环境中必须区分两个地址：

| 地址                                     | 用途                       |
| ---------------------------------------- | -------------------------- |
| `APP_URL=http://127.0.0.1:3010`          | 浏览器、登录回调、外部访问 |
| `INTERNAL_APP_URL=http://127.0.0.1:3210` | 容器内部自调用 webhook     |

原因：

```text
宿主机 127.0.0.1:3010
  -> Docker 端口映射
  -> 容器内 127.0.0.1:3210
```

但在容器内部访问：

```text
127.0.0.1:3010
```

表示容器自己的 `3010` 端口，不是宿主机端口。如果容器内没有监听 `3010`，Gateway 自回调会失败。

因此容器内服务端自调用应使用：

```text
INTERNAL_APP_URL=http://127.0.0.1:3210
```

排查命令：

```bash
# 查看业务容器日志
docker logs --tail 200 naiyunhub

# 查看 Redis 是否可用
docker exec naiyun-redis redis-cli ping

# 查看 naiyunhub 容器内 Redis 配置
docker exec naiyunhub printenv REDIS_URL

# 查看微信 Gateway 运行状态
docker exec naiyun-redis redis-cli --scan --pattern 'bot:runtime-status:wechat:*'
docker exec naiyun-redis redis-cli get 'bot:runtime-status:wechat:<applicationId>'

# 容器内验证内部 Web 端口
docker exec naiyunhub node -e "fetch('http://127.0.0.1:3210').then(r=>console.log(r.status)).catch(e=>console.error(e.cause?.code||e.message))"
```

正常状态示例：

```text
REDIS_URL=redis://127.0.0.1:6379
PONG
{"platform":"wechat","status":"connected",...}
Gateway Started successfully
```

## production/grafana 观测模板

`docker-compose/production/grafana/` 包含带观测组件的生产模板。它不是当前主启动方式，主要用于后续验证生产观测链路。

主要服务：

- naiyunhub
- PostgreSQL
- Redis
- SearXNG
- Grafana
- Tempo
- Prometheus / OpenTelemetry Collector

其中 MinIO / Casdoor 不在该 compose 内启动，连接信息来自仓库根目录 `.env.prod`。

适用场景：

- 验证生产部署拓扑。
- 验证日志、指标、链路追踪。
- 验证 Grafana 看板和 Tempo traces。

启动方式参考：

```bash
docker compose --env-file .env.prod -f docker-compose/production/grafana/docker-compose.yml config
docker compose --env-file .env.prod -f docker-compose/production/grafana/docker-compose.yml up -d
```

停止：

```bash
docker compose --env-file .env.prod -f docker-compose/production/grafana/docker-compose.yml down
```

## 桌面端发布关联

服务器 `APP_URL` 与桌面包里的 `OFFICIAL_CLOUD_SERVER` 必须一致。例如：

```text
APP_URL=https://chat.naiyun.com:10085
OFFICIAL_CLOUD_SERVER=https://chat.naiyun.com:10085
NEXT_PUBLIC_OFFICIAL_URL=https://chat.naiyun.com:10085
```

如果服务器地址、端口或证书发生变化，需要重新生成桌面安装包。具体打包、签名和公证流程见 [NaiYunHub 项目说明文档.md](<NaiYunHub 项目说明文档.md>)。

## 常见问题

### 1. `naiyunhub` 一直 Restarting

查看日志：

```bash
docker logs --tail 200 naiyunhub
```

如果看到 deprecated env 报错，删除或注释：

```text
ACCESS_CODE
NEXT_AUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_SERVICE_MODE
```

### 2. 镜像不存在

现象：

```text
pull access denied
No such image: naiyunchat-db:2.2.4
```

处理：

```bash
docker images | grep naiyunchat-db
docker pull 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4
docker tag 192.168.1.211:5001/naiyun-chat/naiyunchat-db:2.2.4 naiyunchat-db:2.2.4
```

### 3. 容器名称冲突

现象：

```text
Conflict. The container name "/naiyun-redis" is already in use
```

处理：

```bash
docker ps -a --filter "name=naiyun"
docker rm -f naiyunhub naiyun-network naiyun-postgres naiyun-redis naiyun-searxng
```

不要随意删除数据目录和数据卷，避免数据库数据丢失。

### 4. Web 能打开，但微信不回复

优先确认：

```bash
docker exec naiyun-redis redis-cli ping
docker exec naiyun-redis redis-cli --scan --pattern 'bot:runtime-status:wechat:*'
docker logs --tail 300 naiyunhub
```

如果 Redis 正常且状态为 `connected`，重点检查：

- `INTERNAL_APP_URL` 是否是容器内可访问地址。
- 模型调用是否报错。
- Agent 是否启用了可用模型。
- 微信授权是否过期。

### 5. 登录回调异常

检查 `.env.test` 或 `.env.prod` 中的站点地址、Casdoor 回调地址是否一致：

```text
APP_URL
AUTH_CASDOOR_ISSUER
AUTH_CASDOOR_ID
AUTH_CASDOOR_SECRET
```

Casdoor 回调示例：

```text
http://服务器IP:3010/api/auth/callback/casdoor
```

### 6. S3 / MinIO 上传异常

检查：

```text
S3_ENDPOINT
S3_PUBLIC_DOMAIN
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_ENABLE_PATH_STYLE
```

要求：

- `S3_ENDPOINT` 必须是服务端可访问地址。
- `S3_PUBLIC_DOMAIN` 必须是浏览器可访问地址。
- MinIO / S3 需要正确配置 CORS。

如果 `S3_ENDPOINT` 配成 `127.0.0.1` 或 `localhost`，浏览器端通常无法访问服务器上的 MinIO。

### 7. 不想重新构建镜像

使用：

```bash
docker-compose/dev/setup.sh up --no-build
```

确认本地已有镜像：

```bash
docker images naiyunchat-db
```

### 8. 端口冲突

默认端口：

```text
Lobe Web: 3010 -> 3210
PostgreSQL: 仅容器内部
Redis: 仅容器内部
SearXNG: 仅容器内部
```

如需修改 Web 端口：

```bash
LOBE_PORT=3020 docker-compose/dev/setup.sh up --no-build
```

或在当前选择的根目录 env 文件中配置，例如 `.env.development`：

```text
LOBE_PORT=3020
APP_URL=http://127.0.0.1:3020
```

`INTERNAL_APP_URL` 不要跟随宿主机端口变化，仍应指向容器内服务端口：

```text
INTERNAL_APP_URL=http://127.0.0.1:3210
```

## 推荐发布流程

```text
1. 确认 package.json 版本，并记录业务镜像名 naiyunchat-db:<version>
2. 开发主机从 Docker Hub 公网拉取 node:24-slim、busybox:latest 和 compose 基础服务镜像
3. 开发主机将 Docker Hub 公共镜像手动 tag 并 push 到 Harbor 的 naiyun-registry 项目
4. 开发主机执行 docker-compose/dev/setup.sh build --env test/prod --platform amd64
5. 确认 naiyunchat-db:<version> 镜像架构符合目标服务器
6. 开发主机 tag 并 push 业务镜像到 Harbor 的 naiyun-chat 项目
7. 上传 package.json、.env.test/.env.prod、docker-compose 目录到目标服务器
8. 目标服务器只从 Harbor pull 镜像，并 tag 成 compose 需要的本地镜像名
9. docker-compose/dev/setup.sh config --env test/prod
10. docker-compose/dev/setup.sh up --env test/prod --no-build
11. 检查容器状态、日志和页面访问
12. 如桌面端服务地址变化，重新打对应渠道安装包
```
