import { trpc } from '../init';

export interface TelemetryContext {
  userId?: string | null;
}

export interface TelemetryResult {
  telemetryEnabled: boolean;
}

export const checkTelemetryEnabled = async (_ctx: TelemetryContext): Promise<TelemetryResult> => {
  return { telemetryEnabled: false };
};

/**
 * Middleware that checks if telemetry is enabled for the current user
 * and adds telemetryEnabled to the context
 *
 * Requires serverDatabase middleware to be applied first
 */
export const telemetry = trpc.middleware(async (opts) => {
  const result = await checkTelemetryEnabled(opts.ctx as TelemetryContext);

  return opts.next({ ctx: result });
});
