import {
  Wallet,
  PieChart,
  Target,
  TrendingDown,
  Shield,
  BarChart3,
} from "lucide-react";

/**
 * The landing page's feature grid. Icons and order live here; the
 * wording lives in `home.features.*` - `key` names the pair of
 * `<key>Title` / `<key>Body` messages that describe each one.
 */
export const features = [
  { icon: Wallet, key: "control" },
  { icon: PieChart, key: "charts" },
  { icon: Target, key: "envelopes" },
  { icon: TrendingDown, key: "reduce" },
  { icon: Shield, key: "secure" },
  { icon: BarChart3, key: "reports" },
] as const;
