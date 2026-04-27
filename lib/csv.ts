import { DailyRecord, ObservationDate, Plant } from "@/lib/types";

function escapeCsv(value: string | number | boolean | null) {
  if (value === null) {
    return "";
  }

  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function buildCsv(
  plants: Plant[],
  dates: ObservationDate[],
  records: DailyRecord[],
) {
  const byKey = new Map(records.map((record) => [`${record.date}:${record.plantId}`, record]));
  const rows: Array<Array<string | number | boolean | null>> = [
    [
      "date",
      "plantName",
      "flowerCount",
      "fruitCount",
      "flowered",
      "harvestStarted",
      "harvestEnded",
    ],
  ];

  for (const dateRow of dates) {
    for (const plant of plants) {
      const record = byKey.get(`${dateRow.observedOn}:${plant.id}`);
      rows.push([
        dateRow.observedOn,
        plant.name,
        record?.flowerCount ?? null,
        record?.fruitCount ?? null,
        record?.flowered ?? null,
        record?.harvestStarted ?? null,
        record?.harvestEnded ?? null,
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}
