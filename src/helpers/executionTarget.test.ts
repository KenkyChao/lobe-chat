import type { LobeAgentAgencyConfig } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import {
  type ExecutionPlan,
  executionTargetToRuntimeMode,
  resolveExecutionPlan,
  resolveExecutionTarget,
  resolveRuntimeMode,
} from './executionTarget';

const cfg = (over: Partial<LobeAgentAgencyConfig> = {}): LobeAgentAgencyConfig => ({ ...over });

describe('resolveExecutionTarget', () => {
  it('returns the stored target when available', () => {
    expect(resolveExecutionTarget(cfg({ executionTarget: 'device' }), { isDesktop: true })).toBe(
      'device',
    );
    expect(resolveExecutionTarget(cfg({ executionTarget: 'sandbox' }), { isDesktop: true })).toBe(
      'none',
    );
  });

  it('defaults to local on desktop, none on web when unset', () => {
    expect(resolveExecutionTarget(undefined, { isDesktop: true })).toBe('local');
    expect(resolveExecutionTarget(undefined, { isDesktop: false })).toBe('none');
    expect(resolveExecutionTarget(cfg(), { isDesktop: true })).toBe('local');
    expect(resolveExecutionTarget(cfg(), { isDesktop: false })).toBe('none');
  });

  it('coerces a stored `local` to none on web while cloud sandbox is unavailable', () => {
    expect(resolveExecutionTarget(cfg({ executionTarget: 'local' }), { isDesktop: false })).toBe(
      'none',
    );
    // …but keeps it on desktop
    expect(resolveExecutionTarget(cfg({ executionTarget: 'local' }), { isDesktop: true })).toBe(
      'local',
    );
  });

  it('routes hetero desktop-local bindings to the bound device on web', () => {
    expect(
      resolveExecutionTarget(cfg({ boundDeviceId: 'device-a', executionTarget: 'local' }), {
        isDesktop: false,
        isHetero: true,
      }),
    ).toBe('device');

    expect(
      resolveExecutionTarget(cfg({ boundDeviceId: 'device-a', executionTarget: 'local' }), {
        isDesktop: false,
      }),
    ).toBe('none');
  });

  it('keeps `device` on web (a bound device is reachable from anywhere)', () => {
    expect(resolveExecutionTarget(cfg({ executionTarget: 'device' }), { isDesktop: false })).toBe(
      'device',
    );
  });

  it('keeps an explicit `none` on both platforms', () => {
    expect(resolveExecutionTarget(cfg({ executionTarget: 'none' }), { isDesktop: true })).toBe(
      'none',
    );
    expect(resolveExecutionTarget(cfg({ executionTarget: 'none' }), { isDesktop: false })).toBe(
      'none',
    );
  });

  it('coerces `none` for hetero agents — they must execute somewhere', () => {
    // stored none → desktop local, web none while cloud sandbox is unavailable
    expect(
      resolveExecutionTarget(cfg({ executionTarget: 'none' }), { isDesktop: true, isHetero: true }),
    ).toBe('local');
    expect(
      resolveExecutionTarget(cfg({ executionTarget: 'none' }), {
        isDesktop: false,
        isHetero: true,
      }),
    ).toBe('none');
    // unset → platform default, then the same coercion on web
    expect(resolveExecutionTarget(undefined, { isDesktop: true, isHetero: true })).toBe('local');
    expect(resolveExecutionTarget(undefined, { isDesktop: false, isHetero: true })).toBe('none');
  });
});

describe('executionTargetToRuntimeMode', () => {
  it('maps target → tool gate', () => {
    expect(executionTargetToRuntimeMode('local')).toBe('local');
    expect(executionTargetToRuntimeMode('sandbox')).toBe('none');
    expect(executionTargetToRuntimeMode('device')).toBe('none');
    expect(executionTargetToRuntimeMode('none')).toBe('none');
  });
});

describe('resolveRuntimeMode', () => {
  it('derives from the default target when executionTarget is unset', () => {
    // desktop default → local
    expect(resolveRuntimeMode(undefined, true)).toBe('local');
    // web default → none (an unconfigured web agent is plain chat, no run tools)
    expect(resolveRuntimeMode(undefined, false)).toBe('none');
  });

  it('derives from an explicit executionTarget', () => {
    expect(resolveRuntimeMode(cfg({ executionTarget: 'sandbox' }), true)).toBe('none');
    expect(resolveRuntimeMode(cfg({ executionTarget: 'device' }), true)).toBe('none');
    expect(resolveRuntimeMode(cfg({ executionTarget: 'local' }), true)).toBe('local');
    expect(resolveRuntimeMode(cfg({ executionTarget: 'none' }), true)).toBe('none');
  });

  it('applies the web `local` fallback before mapping to runtime mode', () => {
    // executionTarget=local synced from desktop, resolved on web → none while sandbox is unavailable
    expect(resolveRuntimeMode(cfg({ executionTarget: 'local' }), false)).toBe('none');
  });
});

describe('resolveExecutionPlan', () => {
  const ONLINE_A = ['device-a'];
  const ONLINE_AB = ['device-a', 'device-b'];

  describe('none — never routes to a device', () => {
    it('stays none even with a bound device and exactly one device online', () => {
      // the historical bug: single-online-device auto-activation used to
      // bypass an explicit `none`
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ executionTarget: 'none' }),
          isDesktop: true,
          onlineDeviceIds: ONLINE_A,
        }),
      ).toEqual({ kind: 'none', target: 'none' });
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget: 'none' }),
          isDesktop: true,
          onlineDeviceIds: ONLINE_A,
        }),
      ).toEqual({ kind: 'none', target: 'none' });
    });
  });

  describe('sandbox — unavailable', () => {
    it('resolves to none regardless of bound / online devices', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget: 'sandbox' }),
          isDesktop: true,
          onlineDeviceIds: ONLINE_A,
        }),
      ).toEqual({ kind: 'none', target: 'none' });
    });

    it('stays unavailable with canUseDevice=false', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ executionTarget: 'sandbox' }),
          canUseDevice: false,
          isDesktop: true,
          onlineDeviceIds: ONLINE_A,
        }),
      ).toEqual({ kind: 'none', target: 'none' });
    });
  });

  describe('device / local — binding and auto-activation', () => {
    it('uses the bound device when online', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget: 'device' }),
          isDesktop: false,
          onlineDeviceIds: ONLINE_AB,
        }),
      ).toEqual({ deviceId: 'device-a', kind: 'device', target: 'device' });
    });

    it('stays unrouted when the bound device is offline (no silent fallback)', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-x', executionTarget: 'device' }),
          isDesktop: false,
          onlineDeviceIds: ONLINE_AB,
        }),
      ).toEqual({ kind: 'device-unrouted', reason: 'bound-device-offline', target: 'device' });
    });

    it('auto-activates only when exactly one device is online and nothing is bound', () => {
      const local = cfg({ executionTarget: 'local' });
      expect(
        resolveExecutionPlan({ agencyConfig: local, isDesktop: true, onlineDeviceIds: ONLINE_A }),
      ).toEqual({ deviceId: 'device-a', kind: 'device', target: 'local' });
      expect(
        resolveExecutionPlan({ agencyConfig: local, isDesktop: true, onlineDeviceIds: ONLINE_AB }),
      ).toEqual({ kind: 'device-unrouted', reason: 'ambiguous-online-devices', target: 'local' });
      expect(
        resolveExecutionPlan({ agencyConfig: local, isDesktop: true, onlineDeviceIds: [] }),
      ).toEqual({ kind: 'device-unrouted', reason: 'no-online-device', target: 'local' });
    });

    it('treats the desktop default (unset target) as device-capable', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: undefined,
          isDesktop: true,
          onlineDeviceIds: ONLINE_A,
        }),
      ).toEqual({ deviceId: 'device-a', kind: 'device', target: 'local' });
    });

    it('resolves the unset web target to none', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: undefined,
          isDesktop: false,
          onlineDeviceIds: ONLINE_A,
        }),
      ).toEqual({ kind: 'none', target: 'none' });
    });
  });

  describe('requestedDeviceId — explicit per-request override', () => {
    it('forces device routing regardless of the stored target', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ executionTarget: 'sandbox' }),
          isDesktop: false,
          onlineDeviceIds: ONLINE_AB,
          requestedDeviceId: 'device-b',
        }),
      ).toEqual({ deviceId: 'device-b', kind: 'device', target: 'device' });
    });

    it('wins over the agent-bound device', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget: 'device' }),
          isDesktop: false,
          onlineDeviceIds: ONLINE_AB,
          requestedDeviceId: 'device-b',
        }),
      ).toEqual({ deviceId: 'device-b', kind: 'device', target: 'device' });
    });
  });

  describe('canUseDevice=false — external bot senders', () => {
    it('degrades every device-capable target to none', () => {
      for (const executionTarget of ['local', 'device', 'none'] as const) {
        expect(
          resolveExecutionPlan({
            agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget }),
            canUseDevice: false,
            isDesktop: true,
            onlineDeviceIds: ONLINE_A,
            requestedDeviceId: 'device-a',
          }),
        ).toEqual({ kind: 'none', target: 'none' });
      }
    });
  });

  describe('canUseDevice=false — hetero does not fall back to sandbox while unavailable', () => {
    it('sends denied hetero device-capable targets to none', () => {
      // regression: the hetero early-dispatch used to omit the policy, so an
      // external bot sender could run on the owner's bound machine via a
      // synced local/device binding
      for (const executionTarget of ['local', 'device'] as const) {
        expect(
          resolveExecutionPlan({
            agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget }),
            canUseDevice: false,
            isDesktop: false,
            isHetero: true,
          }),
        ).toEqual({ kind: 'none', target: 'none' });
      }
      // requestedDeviceId must not bypass the policy either
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ executionTarget: 'sandbox' }),
          canUseDevice: false,
          isDesktop: false,
          isHetero: true,
          requestedDeviceId: 'device-a',
        }),
      ).toEqual({ kind: 'none', target: 'none' });
    });
  });

  describe('onlineDeviceIds=undefined — hetero dispatch semantics', () => {
    it('trusts the binding without online checks and never auto-activates', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget: 'device' }),
          isDesktop: false,
          isHetero: true,
        }),
      ).toEqual({ deviceId: 'device-a', kind: 'device', target: 'device' });
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ executionTarget: 'device' }),
          isDesktop: false,
          isHetero: true,
        }),
      ).toEqual({ kind: 'device-unrouted', reason: 'no-bound-device', target: 'device' });
    });

    it('uses the bound desktop device for hetero local runs entered from web', () => {
      expect(
        resolveExecutionPlan({
          agencyConfig: cfg({ boundDeviceId: 'device-a', executionTarget: 'local' }),
          isDesktop: false,
          isHetero: true,
        }),
      ).toEqual({ deviceId: 'device-a', kind: 'device', target: 'device' });
    });

    it('sends hetero non-device targets to none while cloud sandbox is unavailable', () => {
      // server resolves hetero with isDesktop=false: unbound local → none,
      // none → none (hetero coercion), sandbox → none
      for (const executionTarget of ['local', 'none', 'sandbox', undefined] as const) {
        const plan: ExecutionPlan = resolveExecutionPlan({
          agencyConfig: executionTarget ? cfg({ executionTarget }) : undefined,
          isDesktop: false,
          isHetero: true,
        });
        expect(plan).toEqual({ kind: 'none', target: 'none' });
      }
    });
  });
});
