import { CLOUD_SANDBOX_ENABLED } from '@lobechat/const';
import type { DeviceExecutionTarget, LobeAgentAgencyConfig, RuntimeEnvMode } from '@lobechat/types';

export interface ResolveExecutionTargetOptions {
  /**
   * Platform of the resolving side. On the server there is no real "desktop"
   * flag — callers pass `gatewayConfigured` as a proxy (a device-gateway
   * deployment serves desktop-class users). See `resolveExecutionPlan`.
   */
  isDesktop: boolean;
  /**
   * Heterogeneous agents (Claude Code / Codex) bring their own toolchain and
   * must execute somewhere, so `'none'` is normally not a valid target for them:
   * it coerces to `'local'` on desktop and `'sandbox'` on web. When the cloud
   * sandbox is disabled, web hetero agents stay on `'none'` until a device is
   * available.
   */
  isHetero?: boolean;
}

/**
 * Single source of truth for where an agent executes — one global
 * `agencyConfig.executionTarget` drives both desktop and web.
 *
 * - `none`    → 无设备 (no execution environment; plain chat)
 * - `local`   → 本机 (this machine, in-process; desktop only)
 * - `sandbox` → 云端沙箱 (server cloud sandbox)
 * - `device`  → 远程设备 (dispatched to `boundDeviceId`)
 *
 * `local` and `device` stay DISTINCT even when the bound device is this very
 * machine: `device` dispatches through the server gateway, so progress streams
 * to every client (mobile/web can follow the run); `local` is the faster
 * in-process IPC path whose run lives only in this desktop session. Which one
 * to use is the user's observability/latency trade-off — never auto-collapse
 * `device(currentDeviceId)` into the in-process path.
 *
 * Defaults: desktop → `local`, web → `none`. On web `local` isn't available
 * (no local filesystem), so a stored `local` (synced from desktop) normally
 * resolves to `sandbox`; while cloud sandbox is disabled, it resolves to
 * `none`. For heterogeneous CLI agents, a desktop `local` selection that has
 * already been bound to that desktop's `deviceId` resolves to `device` on web,
 * so the same machine can execute through `lh connect`.
 */
export const resolveExecutionTarget = (
  agencyConfig: LobeAgentAgencyConfig | undefined,
  { isDesktop, isHetero }: ResolveExecutionTargetOptions,
): DeviceExecutionTarget => {
  const stored = agencyConfig?.executionTarget;
  let effective = stored ?? (isDesktop ? 'local' : 'none');
  const webFallbackTarget: DeviceExecutionTarget = CLOUD_SANDBOX_ENABLED ? 'sandbox' : 'none';

  if (isHetero && !isDesktop && stored === 'local' && agencyConfig?.boundDeviceId) {
    return 'device';
  }
  if (isHetero && effective === 'none') effective = isDesktop ? 'local' : webFallbackTarget;
  if (!isDesktop && effective === 'local') return webFallbackTarget;
  if (!CLOUD_SANDBOX_ENABLED && effective === 'sandbox') return 'none';
  return effective;
};

/**
 * Derive the `runtimeMode` tool gate from the unified execution target:
 * `local` → local-system tools, `sandbox` → cloud sandbox when enabled,
 * `device` → gateway routing, `none` → no run tools (plain chat).
 * `device`/`none` both gate to `'none'` — device tools are routed via
 * `resolveExecutionPlan`, not via runtimeMode.
 */
export const executionTargetToRuntimeMode = (target: DeviceExecutionTarget): RuntimeEnvMode => {
  switch (target) {
    case 'local': {
      return 'local';
    }
    case 'sandbox': {
      return CLOUD_SANDBOX_ENABLED ? 'cloud' : 'none';
    }
    default: {
      return 'none';
    }
  }
};

/**
 * The effective `runtimeMode` (server tool gate) from the unified execution
 * target.
 */
export const resolveRuntimeMode = (
  agencyConfig: LobeAgentAgencyConfig | undefined,
  isDesktop: boolean,
): RuntimeEnvMode =>
  executionTargetToRuntimeMode(resolveExecutionTarget(agencyConfig, { isDesktop }));

export type ExecutionPlanUnroutedReason =
  /** no bound device and more than one device online — the user must bind explicitly */
  | 'ambiguous-online-devices'
  /** an explicitly bound device exists but is offline — never silently fall back */
  | 'bound-device-offline'
  /** target is `device` but nothing is bound */
  | 'no-bound-device'
  /** no device online at all */
  | 'no-online-device';

/**
 * Where (and whether) a run executes, resolved ONCE at the entry point.
 * Downstream layers consume the plan instead of re-deriving the answer from
 * `executionTarget` / `boundDeviceId` / online state themselves.
 *
 * `target` is the EFFECTIVE execution target (platform defaults and coercions
 * applied; degraded to `none` when device access is denied) — consumers must
 * read it instead of re-resolving `agencyConfig.executionTarget`.
 */
export type ExecutionPlan = { target: DeviceExecutionTarget } &
  /** route execution / device tools to this device (includes 本机 — the local machine is a registered device) */
  (| { deviceId: string; kind: 'device' }
    /**
     * Device-targeted but no routable device right now. The run proceeds without
     * an active device; the remote-device proxy may let the model activate one
     * mid-run (native agents), or the caller may treat this as a hard error
     * (hetero dispatch).
     */
    | { kind: 'device-unrouted'; reason: ExecutionPlanUnroutedReason }
    /** plain chat — no execution environment, no run tools, no device ever */
    | { kind: 'none' }
    /** ephemeral cloud sandbox */
    | { kind: 'sandbox' }
  );

/** Device tools (local-system / remote-device proxy) only exist in device-capable sessions. */
export const isDeviceCapablePlan = (plan: ExecutionPlan): boolean =>
  plan.kind === 'device' || plan.kind === 'device-unrouted';

export interface ResolveExecutionPlanParams {
  agencyConfig: LobeAgentAgencyConfig | undefined;
  /**
   * Verdict of `resolveDeviceAccessPolicy` — `false` (e.g. an external bot
   * sender) kills device routing entirely. If cloud sandbox is enabled, sandbox
   * runs can still be used because they never touch user machines. Defaults to
   * `true` (first-party callers).
   */
  canUseDevice?: boolean;
  isDesktop: boolean;
  isHetero?: boolean;
  /**
   * Online device ids from the device gateway. Pass `undefined` to skip
   * online checks and single-device auto-activation entirely — the binding is
   * trusted as-is and dispatch fails loudly if the device is offline (hetero
   * dispatch semantics).
   */
  onlineDeviceIds?: string[];
  /**
   * Explicit per-request device override (e.g. the desktop preset, or a
   * batch-task `deviceId`). Always wins: it forces device routing regardless
   * of the stored target.
   */
  requestedDeviceId?: string;
}

/**
 * Resolve the execution plan for a run. This is THE device decision — every
 * rule about which device (if any) a run touches lives here:
 *
 * 1. `requestedDeviceId` forces device routing; otherwise the resolved
 *    `executionTarget` decides (`local` routes to a device too — the local
 *    machine is just a device).
 * 2. `none` / `sandbox` NEVER route to a device — no auto-activation, no
 *    step-level re-injection, no exceptions.
 * 3. `canUseDevice === false` degrades any device-capable target to `none`.
 *    If cloud sandbox is enabled, sandbox can still run because it never
 *    touches the user's machines.
 * 4. With online info: a bound device is used only if online (an offline
 *    binding stays unrouted rather than guessing another machine); unbound
 *    runs auto-activate only when EXACTLY ONE device is online.
 */
export const resolveExecutionPlan = (params: ResolveExecutionPlanParams): ExecutionPlan => {
  const {
    agencyConfig,
    canUseDevice = true,
    isDesktop,
    isHetero,
    onlineDeviceIds,
    requestedDeviceId,
  } = params;

  const target = resolveExecutionTarget(agencyConfig, { isDesktop, isHetero });
  const wantsDevice = !!requestedDeviceId || target === 'device' || target === 'local';

  if (!wantsDevice || !canUseDevice) {
    if (target === 'sandbox' && CLOUD_SANDBOX_ENABLED) {
      return { kind: 'sandbox', target: 'sandbox' };
    }
    // Hetero agents normally fall back to cloud sandbox when device access is
    // denied. While sandbox is disabled, keep the run tool-free.
    if (isHetero && CLOUD_SANDBOX_ENABLED) return { kind: 'sandbox', target: 'sandbox' };
    // a device-capable target denied by the access policy degrades to plain
    // chat — the effective target is `none`, not the stored one
    return { kind: 'none', target: 'none' };
  }

  const boundDeviceId = requestedDeviceId || agencyConfig?.boundDeviceId;
  // requestedDeviceId may force device routing over a non-device stored target
  const effectiveTarget = target === 'local' ? 'local' : 'device';

  // No online info: trust the binding (the gateway errors on dispatch if the
  // device is offline). No auto-activation without visibility.
  if (!onlineDeviceIds) {
    if (boundDeviceId) return { deviceId: boundDeviceId, kind: 'device', target: effectiveTarget };
    return { kind: 'device-unrouted', reason: 'no-bound-device', target: effectiveTarget };
  }

  if (boundDeviceId) {
    return onlineDeviceIds.includes(boundDeviceId)
      ? { deviceId: boundDeviceId, kind: 'device', target: effectiveTarget }
      : { kind: 'device-unrouted', reason: 'bound-device-offline', target: effectiveTarget };
  }

  if (onlineDeviceIds.length === 1) {
    return { deviceId: onlineDeviceIds[0], kind: 'device', target: effectiveTarget };
  }

  return {
    kind: 'device-unrouted',
    reason: onlineDeviceIds.length === 0 ? 'no-online-device' : 'ambiguous-online-devices',
    target: effectiveTarget,
  };
};
