import { MetricDefinition } from "@/lib/types";

export const METRICS: MetricDefinition[] = [
  { key: "flowerCount", label: "開花数", kind: "count" },
  { key: "fruitCount", label: "結実数", kind: "count" },
  { key: "flowered", label: "開花日", kind: "flag" },
  { key: "harvestStarted", label: "収穫開始日", kind: "flag" },
  { key: "harvestEnded", label: "収穫終了日", kind: "flag" },
];
