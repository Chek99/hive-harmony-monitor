import { createFileRoute } from "@tanstack/react-router";
import { HiveMonitor } from "@/components/hives/hive-monitor";
import { pageHead } from "@/lib/hives";

export const Route = createFileRoute("/hives/")({
  head: () => pageHead("HiveSense — Hive Monitoring", "Acoustic readings, queen predictions, and history for each monitored beehive."),
  component: Hives,
});

function Hives() {
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Hive monitoring</h1><HiveMonitor /></div>;
}