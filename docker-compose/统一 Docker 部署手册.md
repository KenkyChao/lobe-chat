# 统一 Docker 部署手册

本文档用于统一说明 `docker-compose/` 目录下各部署方案的职责、启动方式、环境变量要求和常见排查方法。

## 目录职责

| 目录 | 用途 | 业务镜像 | 依赖服务 | 适用场景 |
| --- | --- | --- | --- | --- |
| `dev/` | 本地源码镜像验证环境 | `naiyunchat-db:${package.json.version}` | 内置 PostgreSQL / Redis / SearXNG，外接 MinIO / Casdoor | 本地私有化联调、验证当前代码镜像 |
| `production/grafana/` | 带观测组件的生产模板 | 生产镜像配置 | PostgreSQL / MinIO / Casdoor / SearXNG / Grafana / Tempo / Prometheus | 生产化观测链路验证 |

当前我们主要使用 `docker-compose/dev/` 做本地源码镜像验证。

## 前置要求

本机需要安装：

```bash
docker version
docker compose version
```

本地源码镜像验证还需要：

```bash
node --version
```

`dev/setup.sh` 会从项目根目录 `package.json` 读取版本号，并使用该版本构建或启动：

```text
naiyunchat-db:${package.json.version}
```

例如当前版本为 `2.2.4` 时，镜像名为：

```text
naiyunchat-db:2.2.4
```

## dev 环境：本地源码镜像验证

### 架构说明

`docker-compose/dev/docker-compose.yml` 的设计目标：

- `network-service` 使用 `alpine`，统一暴露 Web 端口。
- `lobe` 使用本地源码构建出的 `naiyunchat-db:${package.json.version}`。
- `lobe` 不允许拉取云端业务镜像，配置了 `pull_policy: never`。
- PostgreSQL 使用 `paradedb/paradedb:latest-pg17`。
- Redis 使用 `redis:7-alpine`。
- SearXNG 使用 `searxng/searxng`。
- MinIO / Casdoor 不在本地容器中启动，连接信息从项目根目录 `.env.development` 读取。

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

### 环境变量来源

`dev` 环境读取项目根目录：

```text
.env.development
```

关键变量：

| 类型 | 变量 |
| --- | --- |
| 应用地址 | `APP_URL` |
| 内部调用地址 | `INTERNAL_APP_URL`，由 compose 注入为 `http://127.0.0.1:3210` |
| 认证密钥 | `AUTH_SECRET` |
| Casdoor | `AUTH_CASDOOR_ISSUER` / `AUTH_CASDOOR_ID` / `AUTH_CASDOOR_SECRET` |
| S3 / MinIO | `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` |
| 数据库 | compose 覆盖为内部 PostgreSQL |
| Redis | compose 覆盖为内部 Redis |
| 搜索 | compose 覆盖为内部 SearXNG |

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

### 快速启动

从项目根目录执行：

```bash
docker-compose/dev/setup.sh
```

这会执行：

1. 检查 Docker / Compose。
2. 读取 `package.json` 版本。
3. 检查 `.env.development` 必要变量。
4. 构建本地业务镜像 `naiyunchat-db:<version>`。
5. 校验 compose 配置。
6. 启动 `network-service`、`postgresql`、`redis`、`searxng`、`lobe`。

启动后访问：

```text
http://127.0.0.1:3010
```

### 不重新打镜像启动

如果本地已经存在目标镜像，只想用现有镜像启动：

```bash
docker-compose/dev/setup.sh up --no-build
```

启动后跟随日志：

```bash
docker-compose/dev/setup.sh up --no-build --logs
```

如果只改了 `.env.development`，需要重建容器读取新环境变量，但不重新打镜像：

```bash
docker-compose/dev/setup.sh restart --no-build
```

### 常用命令

```bash
# 预检 compose 配置，不启动容器
docker-compose/dev/setup.sh config

# 只构建本地业务镜像
docker-compose/dev/setup.sh build

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

## production/grafana 环境：生产观测模板

`docker-compose/production/grafana/` 包含带观测组件的生产模板。

主要服务：

- LobeChat
- PostgreSQL
- MinIO
- Casdoor
- SearXNG
- Grafana
- Tempo
- Prometheus / OpenTelemetry Collector

适用场景：

- 验证生产部署拓扑。
- 验证日志、指标、链路追踪。
- 验证 Grafana 看板和 Tempo traces。

启动方式参考：

```bash
cd docker-compose/production/grafana
cp .env.example .env
docker compose config
docker compose up -d
```

停止：

```bash
cd docker-compose/production/grafana
docker compose down
```

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

| 地址 | 用途 |
| --- | --- |
| `APP_URL=http://127.0.0.1:3010` | 浏览器、登录回调、外部访问 |
| `INTERNAL_APP_URL=http://127.0.0.1:3210` | 容器内部自调用 webhook |

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
docker logs --tail 200 lobehub

# 查看 Redis 是否可用
docker exec lobe-redis redis-cli ping

# 查看 lobe 容器内 Redis 配置
docker exec lobehub printenv REDIS_URL

# 查看微信 Gateway 运行状态
docker exec lobe-redis redis-cli --scan --pattern 'bot:runtime-status:wechat:*'
docker exec lobe-redis redis-cli get 'bot:runtime-status:wechat:<applicationId>'

# 容器内验证内部 Web 端口
docker exec lobehub node -e "fetch('http://127.0.0.1:3210').then(r=>console.log(r.status)).catch(e=>console.error(e.cause?.code||e.message))"
```

正常状态示例：

```text
REDIS_URL=redis://127.0.0.1:6379
PONG
{"platform":"wechat","status":"connected",...}
Gateway Started successfully
```

## 常见问题

### 1. `lobehub` 一直 Restarting

查看日志：

```bash
docker logs --tail 200 lobehub
```

如果看到 deprecated env 报错，删除或注释：

```text
ACCESS_CODE
NEXT_AUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_SERVICE_MODE
```

### 2. Web 能打开，但微信不回复

优先确认：

```bash
docker exec lobe-redis redis-cli ping
docker exec lobe-redis redis-cli --scan --pattern 'bot:runtime-status:wechat:*'
docker logs --tail 300 lobehub
```

如果 Redis 正常且状态为 `connected`，重点检查：

- `INTERNAL_APP_URL` 是否是容器内可访问地址。
- 模型调用是否报错。
- Agent 是否启用了可用模型。
- 微信授权是否过期。

### 3. 文件上传失败

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

### 4. 不想重新构建镜像

使用：

```bash
docker-compose/dev/setup.sh up --no-build
```

确认本地已有镜像：

```bash
docker images naiyunchat-db
```

### 5. 端口冲突

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

或在 `.env.development` 中配置：

```text
LOBE_PORT=3020
APP_URL=http://127.0.0.1:3020
```

注意：`INTERNAL_APP_URL` 不要跟随宿主机端口变化，仍应指向容器内服务端口：

```text
INTERNAL_APP_URL=http://127.0.0.1:3210
```

## 推荐流程

本地验证当前代码：

```bash
docker-compose/dev/setup.sh config
docker-compose/dev/setup.sh build
docker-compose/dev/setup.sh up --no-build --logs
```

已有镜像，仅启动验证：

```bash
docker-compose/dev/setup.sh up --no-build
```

修改环境变量后重启：

```bash
docker-compose/dev/setup.sh restart --no-build
```

停止：

```bash
docker-compose/dev/setup.sh down
```

带观测生产模板：

```bash
cd docker-compose/production/grafana
docker compose up -d
```
