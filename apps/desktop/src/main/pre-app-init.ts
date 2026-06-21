import path from 'node:path';

import { app } from 'electron';
import * as electronIs from 'electron-is';

import { APP_DISPLAY_NAME, DEV_USER_DATA_NAME } from './const/branding';

// Must run BEFORE any module captures `app.getPath('userData')` (e.g. `@/const/dir`
// reads it at top level). Once a path is read, `setName` / `setPath` no-op for it.
//
// Dev now uses the same `app://renderer/` origin as prod, so localStorage / cookies /
// IndexedDB would collide if both shared the packaged-app's userData dir. Pin dev to
// a sibling directory so prod sessions stay clean.
app.setName(APP_DISPLAY_NAME);

if (electronIs.dev()) {
  app.setPath('userData', path.join(app.getPath('appData'), DEV_USER_DATA_NAME));
}
