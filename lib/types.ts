export type MetricKey =
  | "flowerCount"
  | "fruitCount"
  | "flowered"
  | "harvestStarted"
  | "harvestEnded";

export type Plant = {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
};

export type ObservationDate = {
  observedOn: string;
  createdAt: string;
};

export type DailyRecord = {
  date: string;
  plantId: string;
  flowerCount: number | null;
  fruitCount: number | null;
  flowered: boolean | null;
  harvestStarted: boolean | null;
  harvestEnded: boolean | null;
};

export type TrackerPayload = {
  plants: Plant[];
  dates: ObservationDate[];
  records: DailyRecord[];
};

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  kind: "count" | "flag";
};
