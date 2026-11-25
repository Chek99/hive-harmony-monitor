import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, Crown, Hexagon, WifiOff } from "lucide-react";
import { HIVES, STATUS, pageHead } from "@/lib/hives";

export const Route = createFileRoute("/")({
  head: () => pageHead("HiveSense — Apiary Overview", "Apiary overview with queen predictions, offline nodes, and acoustic hive monitoring."),
  component: Overview,
});

function Overview() {
  const stats = [
    { label: "Total hives", value: HIVES.length, icon: Hexagon, tone: "text-primary" },
    { label: "Queen present", value: HIVES.filter(h => h.status === "queenright").length, icon: Crown, tone: "text-success" },
    { label: "Queenless", value: HIVES.filter(h => h.status === "queenless").length, icon: AlertTriangle, tone: "text-destructive" },
    { label: "Node offline", value: HIVES.filter(h => h.status === "offline").length, icon: WifiOff, tone: "text-muted-foreground" },
  ];
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Apiary overview</h1><p className="mt-1 text-sm text-muted-foreground">Queen predictions and node status</p></div>
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className={`size-4 shrink-0 ${tone}`} />{label}</div><p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p></div>)}</section>
    <section className="border-y border-destructive/40 bg-destructive/10 p-4 flex items-start gap-3"><AlertTriangle className="size-5 shrink-0 text-destructive" /><div className="flex-1 text-sm"><p className="font-semibold">Action needed: Hive 02, Hive 06 likely queenless</p><p className="mt-1 text-muted-foreground">Inspect colonies to confirm queen presence.</p></div><Link to="/alerts" aria-label="View alerts" className="text-destructive"><ArrowUpRight className="size-5" /></Link></section>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Your hives</h2><Link to="/hives" className="text-sm text-primary flex items-center gap-1">View all<ArrowUpRight className="size-4" /></Link></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{HIVES.map(h => <Link key={h.id} to="/hives/$hiveId" params={{ hiveId: h.id }} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{h.name}</h3><ArrowUpRight className="size-4 shrink-0 text-muted-foreground" /></div><span className={`mt-3 inline-block text-xs px-2 py-1 rounded-full border ${STATUS[h.status].cls}`}>{STATUS[h.status].label}</span><div className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground"><span>{h.status === "offline" ? "No signal" : `${h.freq} Hz · ${h.confidence}% confidence`}</span><span>{h.lastSeen} ago</span></div></Link>)}</div></section>
  </div>;
}
