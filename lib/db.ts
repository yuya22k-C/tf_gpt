import { Pool } from "pg";
import { DailyRecord, ObservationDate, Plant } from "@/lib/types";

declare global {
  var __tomatoTrackerPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
}

export function getPool() {
  if (!global.__tomatoTrackerPool) {
    global.__tomatoTrackerPool = createPool();
  }

  return global.__tomatoTrackerPool;
}

function mapPlant(row: Record<string, unknown>): Plant {
  return {
    id: String(row.id),
    name: String(row.name),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapObservationDate(row: Record<string, unknown>): ObservationDate {
  return {
    observedOn: String(row.observed_on),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapDailyRecord(row: Record<string, unknown>): DailyRecord {
  return {
    date: String(row.observed_on),
    plantId: String(row.plant_id),
    flowerCount: row.flower_count === null ? null : Number(row.flower_count),
    fruitCount: row.fruit_count === null ? null : Number(row.fruit_count),
    flowered: row.flowered === null ? null : Boolean(row.flowered),
    harvestStarted: row.harvest_started === null ? null : Boolean(row.harvest_started),
    harvestEnded: row.harvest_ended === null ? null : Boolean(row.harvest_ended),
  };
}

export async function listPlants() {
  const result = await getPool().query(
    `select id, name, sort_order, created_at
     from plants
     order by sort_order asc, created_at asc`,
  );

  return result.rows.map(mapPlant);
}

export async function listObservationDates() {
  const result = await getPool().query(
    `select observed_on, created_at
     from observation_dates
     order by observed_on desc`,
  );

  return result.rows.map(mapObservationDate);
}

export async function listRecords(from?: string, to?: string) {
  const params: string[] = [];
  const whereClauses: string[] = [];

  if (from) {
    params.push(from);
    whereClauses.push(`observed_on >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    whereClauses.push(`observed_on <= $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `where ${whereClauses.join(" and ")}` : "";

  const result = await getPool().query(
    `select observed_on, plant_id, flower_count, fruit_count, flowered, harvest_started, harvest_ended
     from daily_records
     ${whereSql}
     order by observed_on desc, plant_id asc`,
    params,
  );

  return result.rows.map(mapDailyRecord);
}

export async function insertPlant(id: string, name: string) {
  const pool = getPool();
  const nextSortOrder = await pool.query(
    `select coalesce(max(sort_order), 0) + 1 as next_sort_order from plants`,
  );
  const sortOrder = Number(nextSortOrder.rows[0]?.next_sort_order ?? 1);

  const result = await pool.query(
    `insert into plants (id, name, sort_order)
     values ($1, $2, $3)
     returning id, name, sort_order, created_at`,
    [id, name, sortOrder],
  );

  return mapPlant(result.rows[0]);
}

export async function renamePlant(id: string, name: string) {
  const result = await getPool().query(
    `update plants
     set name = $2
     where id = $1
     returning id, name, sort_order, created_at`,
    [id, name],
  );

  return result.rows[0] ? mapPlant(result.rows[0]) : null;
}

export async function removePlant(id: string) {
  await getPool().query(`delete from plants where id = $1`, [id]);
}

export async function insertObservationDate(date: string) {
  const result = await getPool().query(
    `insert into observation_dates (observed_on)
     values ($1)
     on conflict (observed_on) do update set observed_on = excluded.observed_on
     returning observed_on, created_at`,
    [date],
  );

  return mapObservationDate(result.rows[0]);
}

export async function removeObservationDate(date: string) {
  const pool = getPool();
  await pool.query(`delete from daily_records where observed_on = $1`, [date]);
  await pool.query(`delete from observation_dates where observed_on = $1`, [date]);
}

type UpsertRecordInput = {
  date: string;
  plantId: string;
  flowerCount?: number | null;
  fruitCount?: number | null;
  flowered?: boolean | null;
  harvestStarted?: boolean | null;
  harvestEnded?: boolean | null;
};

export async function upsertRecord(input: UpsertRecordInput) {
  await insertObservationDate(input.date);

  const result = await getPool().query(
    `insert into daily_records (
        observed_on,
        plant_id,
        flower_count,
        fruit_count,
        flowered,
        harvest_started,
        harvest_ended
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (observed_on, plant_id) do update
      set flower_count = excluded.flower_count,
          fruit_count = excluded.fruit_count,
          flowered = excluded.flowered,
          harvest_started = excluded.harvest_started,
          harvest_ended = excluded.harvest_ended
      returning observed_on, plant_id, flower_count, fruit_count, flowered, harvest_started, harvest_ended`,
    [
      input.date,
      input.plantId,
      input.flowerCount ?? null,
      input.fruitCount ?? null,
      input.flowered ?? null,
      input.harvestStarted ?? null,
      input.harvestEnded ?? null,
    ],
  );

  return mapDailyRecord(result.rows[0]);
}

export async function removeRecord(date: string, plantId: string) {
  await getPool().query(
    `delete from daily_records where observed_on = $1 and plant_id = $2`,
    [date, plantId],
  );
}
