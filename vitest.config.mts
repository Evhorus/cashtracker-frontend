import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Per-file environment: most tests are pure logic (formatting, date
    // arithmetic, status derivation, mappers) and have no reason to pay
    // for a DOM. The few component tests opt in with a
    // `@vitest-environment jsdom` docblock - see price-input.test.tsx.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // A deliberately non-UTC timezone, west of UTC. Half of
    // date-helpers.ts exists precisely because a calendar date must not
    // be timezone-converted while a real instant must be, and under
    // TZ=UTC those two behaviours are indistinguishable - every test
    // would pass even if the distinction were broken. Bogotá (UTC-5) is
    // also the app's primary locale.
    env: { TZ: "America/Bogota" },
  },
  resolve: {
    // Mirrors the "@/*" path alias from tsconfig.json. Set by hand
    // rather than pulling in vite-tsconfig-paths for a single alias.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
