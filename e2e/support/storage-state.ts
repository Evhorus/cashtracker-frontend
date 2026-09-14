/**
 * Where the signed-in session is saved.
 *
 * Its own module on purpose: playwright.config.ts needs this value, and
 * importing it from global.setup.ts would execute that file's `setup()`
 * call while the config is still loading, which Playwright rejects.
 */
export const STORAGE_STATE = "e2e/.auth/user.json";
