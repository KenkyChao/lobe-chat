import { DesktopOnboardingScreen } from './types';

interface ResolveInitialScreenInput {
  /** Whether the telemetry/data-mode step is available in the current build. */
  dataModeEnabled?: boolean;
  /** Has the user previously completed onboarding on this install? */
  everCompleted: boolean;
  /** Running on macOS — drives the Permissions screen fallback. */
  isMac: boolean;
  /** Explicit `?screen=` query parameter, when present and valid. */
  requested: DesktopOnboardingScreen | null;
  /** Whatever screen the component last persisted, or `null` if cleared/missing. */
  saved: DesktopOnboardingScreen | null;
}

/**
 * Pick which onboarding screen the user should land on when entering
 * `/desktop-onboarding`. Priority:
 *
 * 1. `requested` from the URL — explicit deep-link wins.
 * 2. `saved` — a mid-flow user resumes where they left off.
 * 3. `Login` if the user has *ever* completed onboarding (returning user after
 *    sign-out / token expiry — Welcome / Permissions / DataMode are first-run
 *    screens and would force the whole flow again).
 * 4. `Welcome` for first-time users.
 *
 * On non-macOS, `Permissions` is rewritten to `DataMode` when that step is
 * available; otherwise it falls through to `Login`.
 */
export const resolveInitialScreen = ({
  dataModeEnabled = true,
  everCompleted,
  isMac,
  requested,
  saved,
}: ResolveInitialScreenInput): DesktopOnboardingScreen => {
  const fallback = everCompleted ? DesktopOnboardingScreen.Login : DesktopOnboardingScreen.Welcome;
  const chosen = requested ?? saved ?? fallback;

  if (!isMac && chosen === DesktopOnboardingScreen.Permissions) {
    return dataModeEnabled ? DesktopOnboardingScreen.DataMode : DesktopOnboardingScreen.Login;
  }

  if (!dataModeEnabled && chosen === DesktopOnboardingScreen.DataMode) {
    return DesktopOnboardingScreen.Login;
  }

  return chosen;
};
