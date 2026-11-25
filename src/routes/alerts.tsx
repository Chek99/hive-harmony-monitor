import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, WifiOff } from "lucide-react";
import { HIVES, pageHead } from "@/lib/hives";

export const Route = createFileRoute("/alerts")({
  head: () => pageHead("HiveSense — Apiary Alerts", "Queenless hive predictions and disconnected ESP32 node alerts."),
  component: Alerts,
});

function Alerts() {
  const alerts = HIVES.filter(h => h.status !== "queenright");
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Alerts</h1><p className="mt-1 text-sm text-muted-foreground">{alerts.length} hives need attention</p></div><section className="divide-y divide-border border-y border-border">{alerts.map(h => <div key={h.id} className="py-6 flex items-start gap-4">{h.status === "offline" ? <WifiOff className="size-5 shrink-0 text-muted-foreground" /> : <AlertTriangle className="size-5 shrink-0 text-destructive" />}<div className="min-w-0 flex-1"><h2 className="font-semibold">{h.name} · {h.status === "offline" ? "Node disconnected" : "Likely queenless"}</h2><p className="mt-2 text-sm text-muted-foreground">{h.status === "offline" ? `No signal from ${h.device}. Last seen ${h.lastSeen} ago. Check the node's power and WiFi connection.` : `${h.confidence}% model confidence · Dominant frequency ${h.freq} Hz. Inspect the colony to confirm queen presence.`}</p><Link to="/hives/$hiveId" params={{ hiveId: h.id }} className="inline-flex items-center gap-1 text-sm text-primary mt-3">View hive<ArrowUpRight className="size-4" /></Link></div></div>)}</section></div>;
}