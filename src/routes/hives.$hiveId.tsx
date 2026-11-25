import { createFileRoute, notFound } from "@tanstack/react-router";
import { HiveMonitor } from "@/components/hives/hive-monitor";
import { HIVES, pageHead } from "@/lib/hives";

export const Route = createFileRoute("/hives/$hiveId")({
  loader: ({ params }) => {
    const hive = HIVES.find(h => h.id === params.hiveId);
    if (!hive) throw notFound();
    return hive;
  },
  head: ({ loaderData }) => pageHead(`HiveSense — ${loaderData?.name ?? "Hive unavailable"}`, "Individual hive acoustic readings, queen prediction, and sensor connection status."),
  component: HiveDetail,
});

function HiveDetail() {
  const { hiveId } = Route.useParams();
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Hive monitoring</h1><HiveMonitor selectedId={hiveId} /></div>;
}