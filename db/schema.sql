create table if not exists plants (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists observation_dates (
  observed_on date primary key,
  created_at timestamptz not null default now()
);

create table if not exists daily_records (
  observed_on date not null,
  plant_id text not null references plants(id) on delete cascade,
  flower_count integer,
  fruit_count integer,
  flowered boolean,
  harvest_started boolean,
  harvest_ended boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (observed_on, plant_id)
);

create index if not exists daily_records_plant_id_idx on daily_records (plant_id);

create or replace function touch_daily_records_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists daily_records_set_updated_at on daily_records;

create trigger daily_records_set_updated_at
before update on daily_records
for each row
execute function touch_daily_records_updated_at();
