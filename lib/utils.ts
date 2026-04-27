import { DailyRecord, MetricKey } from "@/lib/types";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function normalizeDateInput(input: string) {
  return input.trim();
}

export function getRecordKey(date: string, plantId: string) {
  return `${date}:${plantId}`;
}

export function emptyRecord(date: string, plantId: string): DailyRecord {
  return {
    date,
    plantId,
    flowerCount: null,
    fruitCount: null,
    flowered: null,
    harvestStarted: null,
    harvestEnded: null,
  };
}

export function setMetricValue(
  record: DailyRecord,
  key: MetricKey,
  value: number | boolean | null,
) {
  if (key === "flowerCount" || key === "fruitCount") {
    return {
      ...record,
      [key]: typeof value === "number" ? value : null,
    };
  }

  return {
    ...record,
    [key]: typeof value === "boolean" ? value : null,
  };
}
