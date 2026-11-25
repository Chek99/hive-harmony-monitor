import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, Wifi, WifiOff, Battery, Mic, ArrowUpRight } from "lucide-react";
import { HIVES, pageHead } from "@/lib/hives";

export const Route = createFileRoute("/devices")({
  head: () => pageHead("HiveSense — ESP32 Devices", "ESP32 microphone nodes, WiFi signal, battery readings, and last uploads."),
  component: Devices,
});

function Devices() {
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Devices</h1><p className="mt-1 text-sm text-muted-foreground">{HIVES.length - HIVES.filter(h => h.status === "offline").length} connected · {HIVES.filter(h => h.status === "offline").length} offline</p></div><section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{HIVES.map(h => {
    const offline = h.status === "offline";
    return <article key={h.id} className="rounded-lg border border-border bg-card p-5"><div className="flex items-center justify-between gap-2"><Cpu className="size-5 text-primary" /><span className={`flex items-center gap-1 text-xs ${offline ? "text-muted-foreground" : "text-success"}`}>{offline ? <WifiOff className="size-3" /> : <Wifi className="size-3" />}{offline ? "Node offline" : "Connected"}</span></div><h2 className="mt-4 font-mono font-semibold break-all">{h.device}</h2><Link to="/hives/$hiveId" params={{ hiveId: h.id }} className="mt-1 text-sm text-primary inline-flex items-center gap-1">{h.name}<ArrowUpRight className="size-3" /></Link><dl className="mt-5 space-y-3 text-sm">{[{ label: "WiFi signal", value: offline ? "No signal" : `${h.rssi} dBm`, icon: Wifi }, { label: "Battery", value: offline ? "No signal" : `${h.battery}%`, icon: Battery }, { label: "Mic sample rate", value: offline ? "No signal" : "16 kHz", icon: Mic }].map(({ label, value, icon: Icon }) => <div key={label} className="flex justify-between gap-2"><dt className="flex items-center gap-2 text-muted-foreground"><Icon className="size-4" />{label}</dt><dd className="font-mono text-xs">{value}</dd></div>)}<div className="flex justify-between gap-2 border-t border-border pt-3"><dt className="text-muted-foreground">Last upload</dt><dd className="font-mono text-xs">{h.lastSeen} ago</dd></div></dl></article>;
  })}</section></div>;
}