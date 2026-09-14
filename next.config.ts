import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// request.ts lives under src/shared/config/i18n/ rather than the
// default ./src/i18n/, so the path has to be named.
const withNextIntl = createNextIntlPlugin(
  "./src/shared/config/i18n/request.ts",
);

export default withNextIntl(nextConfig);
