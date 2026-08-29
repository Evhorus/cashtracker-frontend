import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import clerkNext from "@clerk/eslint-plugin/next";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "@clerk/next": clerkNext },
    rules: {
      "@clerk/next/require-auth-protection": [
        "error",
        {
          protected: ["src/app/dashboard/**", "src/features/**"],
          public: [
            "src/app/(auth)/**",
            "src/app/(home)/**",
            // Changing language needs no session - the landing page and
            // the sign-in screen both offer the switcher, so requiring
            // auth here would break it for exactly the visitors most
            // likely to need it.
            "src/features/locale/**",
          ],
          resources: {
            routeHandlers: true,
            serverFunctions: true,
            serverComponentEntrypoints: true,
          },
        },
      ],
    },
  },
  {
    // components/ui is stock shadcn output (regenerable via
    // `shadcn add --overwrite`), not code we hand-write. Relax the one
    // rule most likely to fire on upstream shadcn registry source
    // (some official components use `any` in third-party type glue,
    // e.g. chart tooltip formatters) so the team never needs to hand-edit
    // generated files just to satisfy lint. No other rules are disabled
    // here - there's no evidence today that anything else fires on this
    // folder; add further scoped exceptions only if a real
    // `shadcn add`/`shadcn diff` run actually produces a finding.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
  ]),
  // Must stay last: only turns off formatting-related rules that would
  // conflict with Prettier, doesn't touch correctness rules.
  eslintConfigPrettier,
]);

export default eslintConfig;
