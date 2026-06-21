#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_NAME="${NAIYUN_ENV:-development}"

ACTION="up"
BUILD_IMAGE=1
PULL_BASE=0
DETACH=1
FOLLOW_LOGS=0
USE_CN_MIRROR="${USE_CN_MIRROR:-false}"

log() {
  printf '\033[1;34m==>\033[0m %s\n' "$*"
}

warn() {
  printf '\033[1;33mWARN\033[0m %s\n' "$*" >&2
}

fail() {
  printf '\033[1;31mERROR\033[0m %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage:
  docker-compose/dev/setup.sh [action] [options]

Actions:
  up          Build local app image, validate compose, and start services (default)
  build       Build only the local app image
  pull        Pull base service images only
  config      Validate compose config only
  status|ps   Show service status
  logs        Follow lobe logs
  restart     Recreate services
  down|stop   Stop and remove services, keeping volumes/data

Options:
  --env <name>      Select env file: development, test, or prod (default: development)
  --no-build       Skip building naiyunchat-db:<package.version>
  --pull-base      Pull alpine/postgresql/redis/searxng before starting
  --foreground     Run compose up in the foreground
  -d, --detach     Run compose up detached (default)
  --logs           Follow lobe logs after detached startup
  --use-cn-mirror  Pass USE_CN_MIRROR=true to docker build
  -h, --help       Show this help

Examples:
  docker-compose/dev/setup.sh
  docker-compose/dev/setup.sh restart --env test --no-build
  docker-compose/dev/setup.sh restart --env prod --no-build
  docker-compose/dev/setup.sh up --pull-base --logs
  docker-compose/dev/setup.sh build --use-cn-mirror
  docker-compose/dev/setup.sh down
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    up|start|build|pull|config|status|ps|logs|restart|down|stop)
      ACTION="$1"
      shift
      ;;
    --env)
      [[ $# -ge 2 ]] || fail "--env requires one of: development, test, prod"
      ENV_NAME="$2"
      shift 2
      ;;
    --env=*)
      ENV_NAME="${1#--env=}"
      shift
      ;;
    --no-build)
      BUILD_IMAGE=0
      shift
      ;;
    --pull-base)
      PULL_BASE=1
      shift
      ;;
    --foreground)
      DETACH=0
      shift
      ;;
    -d|--detach)
      DETACH=1
      shift
      ;;
    --logs)
      FOLLOW_LOGS=1
      shift
      ;;
    --use-cn-mirror)
      USE_CN_MIRROR=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

case "${ENV_NAME}" in
  development|test|prod) ;;
  *)
    fail "Unsupported env: ${ENV_NAME}. Expected one of: development, test, prod."
    ;;
esac

ENV_FILE="${ROOT_DIR}/.env.${ENV_NAME}"
NAIYUN_ENV_FILE="../../.env.${ENV_NAME}"

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

read_package_version() {
  if command_exists node; then
    node -e "console.log(require(process.argv[1]).version)" "${ROOT_DIR}/package.json"
    return
  fi

  sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${ROOT_DIR}/package.json" | head -n 1
}

env_has_key() {
  grep -Eq "^[[:space:]]*(export[[:space:]]+)?$1[[:space:]]*=" "${ENV_FILE}"
}

read_env_value() {
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" "${ENV_FILE}" \
    | tail -n 1 \
    | sed "s/^[\"']//;s/[\"']$//"
}

require_docker() {
  command_exists docker || fail "Docker is not installed or not in PATH."
  docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required. Please make sure 'docker compose' works."
}

check_env_file() {
  [[ -f "${ENV_FILE}" ]] || fail "Missing ${ENV_FILE}. This deployment reads external MinIO/Casdoor config from it."

  local missing=()
  local required_keys=(
    S3_ENDPOINT
    S3_BUCKET
    S3_ACCESS_KEY_ID
    S3_SECRET_ACCESS_KEY
    AUTH_CASDOOR_ISSUER
    AUTH_CASDOOR_ID
    AUTH_CASDOOR_SECRET
  )

  for key in "${required_keys[@]}"; do
    if ! env_has_key "${key}"; then
      missing+=("${key}")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    fail "${ENV_FILE} is missing required keys: ${missing[*]}"
  fi

  if ! env_has_key AUTH_SECRET; then
    if env_has_key NEXT_AUTH_SECRET; then
      warn "${ENV_FILE} has NEXT_AUTH_SECRET but not AUTH_SECRET. Runtime auth may require AUTH_SECRET with the same value."
    else
      warn "${ENV_FILE} is missing AUTH_SECRET. Login may fail until it is added."
    fi
  fi

  local s3_endpoint
  s3_endpoint="$(read_env_value S3_ENDPOINT || true)"
  if [[ "${s3_endpoint}" == http://127.0.0.1* || "${s3_endpoint}" == http://localhost* || "${s3_endpoint}" == https://localhost* ]]; then
    warn "S3_ENDPOINT=${s3_endpoint} points to localhost. Browser uploads need a browser-accessible external MinIO endpoint."
  fi
}

compose() {
  NAIYUN_ENV_FILE="${NAIYUN_ENV_FILE}" \
    NAIYUNCHAT_DB_VERSION="${APP_VERSION}" \
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

build_image() {
  local image="naiyunchat-db:${APP_VERSION}"
  local build_args=(-t "${image}")
  local passthrough_args=(
    NEXT_PUBLIC_BASE_PATH
    NEXT_PUBLIC_SENTRY_DSN
    NEXT_PUBLIC_ANALYTICS_POSTHOG
    NEXT_PUBLIC_POSTHOG_HOST
    NEXT_PUBLIC_POSTHOG_KEY
    NEXT_PUBLIC_ANALYTICS_UMAMI
    NEXT_PUBLIC_UMAMI_SCRIPT_URL
    NEXT_PUBLIC_UMAMI_WEBSITE_ID
    FEATURE_FLAGS
  )

  if [[ "${USE_CN_MIRROR}" == "true" ]]; then
    build_args+=(--build-arg USE_CN_MIRROR=true)
  fi

  for arg in "${passthrough_args[@]}"; do
    if [[ -n "${!arg:-}" ]]; then
      build_args+=(--build-arg "${arg}=${!arg}")
    fi
  done

  log "Building local app image: ${image}"
  docker build "${build_args[@]}" "${ROOT_DIR}"
}

pull_base_images() {
  log "Pulling base service images"
  compose pull network-service postgresql redis searxng
}

validate_config() {
  log "Validating compose config"
  compose config --quiet
}

print_access_info() {
  local port
  port="${LOBE_PORT:-$(read_env_value LOBE_PORT || true)}"
  port="${port:-3010}"

  log "Lobe Web: http://127.0.0.1:${port}"
  log "Environment: ${ENV_NAME}"
  log "Compose file: ${COMPOSE_FILE}"
  log "Env file: ${ENV_FILE}"
}

main() {
  cd "${ROOT_DIR}"
  require_docker

  APP_VERSION="$(read_package_version)"
  [[ -n "${APP_VERSION}" ]] || fail "Cannot read version from ${ROOT_DIR}/package.json."
  export APP_VERSION

  case "${ACTION}" in
    build)
      build_image
      ;;
    pull)
      check_env_file
      pull_base_images
      ;;
    config)
      check_env_file
      validate_config
      ;;
    status|ps)
      check_env_file
      compose ps
      ;;
    logs)
      check_env_file
      compose logs -f lobe
      ;;
    down|stop)
      check_env_file
      log "Stopping dev deployment"
      compose down
      ;;
    restart)
      check_env_file
      if [[ "${BUILD_IMAGE}" == "1" ]]; then
        build_image
      fi
      validate_config
      log "Recreating dev deployment"
      compose up -d --force-recreate
      print_access_info
      ;;
    up|start)
      check_env_file
      if [[ "${BUILD_IMAGE}" == "1" ]]; then
        build_image
      fi
      if [[ "${PULL_BASE}" == "1" ]]; then
        pull_base_images
      fi
      validate_config
      log "Starting dev deployment"
      if [[ "${DETACH}" == "1" ]]; then
        compose up -d
        print_access_info
        if [[ "${FOLLOW_LOGS}" == "1" ]]; then
          compose logs -f lobe
        fi
      else
        compose up
      fi
      ;;
    *)
      fail "Unsupported action: ${ACTION}"
      ;;
  esac
}

main "$@"
