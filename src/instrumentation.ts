/**
 * Validates the server environment at boot.
 *
 * Without this the first bad request is what surfaces a missing variable,
 * and the three NEXT_PUBLIC_URL readers never surfaced it at all - they
 * fell back to localhost:4001 in silence, so a production deploy shipped
 * a sitemap.xml pointing at a developer's machine.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  await import("@/shared/config/env.server");
}
