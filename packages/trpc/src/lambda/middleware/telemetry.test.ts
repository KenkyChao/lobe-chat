// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { type TelemetryContext, checkTelemetryEnabled } from './telemetry';

describe('checkTelemetryEnabled', () => {
  it('always disables telemetry for signed-in users', async () => {
    const result = await checkTelemetryEnabled({
      userId: 'test-user',
    } satisfies TelemetryContext);

    expect(result).toEqual({ telemetryEnabled: false });
  });

  it('always disables telemetry for anonymous users', async () => {
    const result = await checkTelemetryEnabled({
      userId: null,
    } satisfies TelemetryContext);

    expect(result).toEqual({ telemetryEnabled: false });
  });
});
