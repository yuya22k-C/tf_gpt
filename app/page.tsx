import { TrackerApp } from "@/components/tracker-app";
import { listObservationDates, listPlants, listRecords } from "@/lib/db";
import { secretHeaderName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [plants, dates, records] = await Promise.all([
    listPlants(),
    listObservationDates(),
    listRecords(),
  ]);

  return (
    <TrackerApp
      initialData={{ plants, dates, records }}
      editSecretHeader={secretHeaderName()}
    />
  );
}
