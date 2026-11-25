import {
  Wallet,
  PieChart,
  Target,
  TrendingDown,
  Shield,
  BarChart3,
} from "lucide-react";

/** Landing feature grid; each `key` maps to `home.features.<key>Title` and `<key>Body`. */
export const features = [
  { icon: Wallet, key: "control" },
  { icon: PieChart, key: "charts" },
  { icon: Target, key: "envelopes" },
  { icon: TrendingDown, key: "reduce" },
  { icon: Shield, key: "secure" },
  { icon: BarChart3, key: "reports" },
] as const;
