import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Crown, Cpu, Mic, Thermometer, Wifi, Battery, Hexagon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HiveSense Dashboard — Queen Detection" },
      { name: "description", content: "Live acoustic monitoring of beehives with ESP32 sensors and queen presence prediction." },
      { property: "og:title", content: "HiveSense Dashboard — Queen Detection" },
      { property: "og:description", content: "Live acoustic monitoring of beehives with ESP32 sensors and queen presence prediction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Status = "queenright" | "queenless" | "uncertain";
type Hive = { id: string; name: string; device: string; status: Status; confidence: number; freq: number; db: number; temp: number; battery: number; rssi: number; lastSeen: string };

// Sample data — replace with live ESP32 readings
const HIVES: Hive[] = [
  { id: "H1", name: "Hive 01 · Acacia", device: "esp32-a1f3", status: "queenright", confidence: 94, freq: 248, db: 62, temp: 34.8, battery: 87, rssi: -58, lastSeen: "12s" },
  { id: "H2", name: "Hive 02 · Meadow", device: "esp32-b72c", status: "queenless", confidence: 88, freq: 312, db: 71, temp: 33.1, battery: 64, rssi: -67, lastSeen: "8s" },
  { id: "H3", name: "Hive 03 · Orchard", device: "esp32-c09e", status: "queenright", confidence: 91, freq: 236, db: 59, temp: 35.0, battery: 92, rssi: -52, lastSeen: "20s" },
  { id: "H4", name: "Hive 04 · Ridge", device: "esp32-d4a8", status: "uncertain", confidence: 57, freq: 279, db: 66, temp: 34.2, battery: 41, rssi: -74, lastSeen: "1m" },
  { id: "H5", name: "Hive 05 · Riverbank", device: "esp32-e551", status: "queenright", confidence: 97, freq: 241, db: 60, temp: 34.9, battery: 78, rssi: -61, lastSeen: "5s" },
  { id: "H6", name: "Hive 06 · Hilltop", device: "esp32-f20b", status: "queenless", confidence: 82, freq: 325, db: 73, temp: 32.6, battery: 55, rssi: -70, lastSeen: "15s" },
];

const STATUS = {
  queenright: { label: "Queen present", cls: "text-success bg-success/10 border-success/30" },
  queenless: { label: "Queenless", cls: "text-destructive bg-destructive/10 border-destructive/30" },
  uncertain: { label: "Uncertain", cls: "text-warning bg-warning/10 border-warning/30" },
} as const;

function spectrum(h: Hive) {
  return Array.from({ length: 24 }, (_, i) => {
    const f = 100 + i * 25;
    const peak = Math.exp(-((f - h.freq) ** 2) / 1800) * 100;
    const harm = h.status === "queenless" ? Math.exp(-((f - 450) ** 2) / 2500) * 45 : 0;
    return { f, a: Math.round(peak + harm + ((i * 37) % 9)) };
  });
}
function history(h: Hive) {
  return Array.from({ length: 24 }, (_, i) => ({
    t: `${i}:00`,
    db: Math.round(h.db + Math.sin(i / 3) * 5 + ((i * 13) % 4)),
    conf: Math.max(20, Math.min(100, Math.round(h.confidence + Math.cos(i / 4) * 6))),
  }));
}

function Dashboard() {
  const [sel, setSel] = useState(HIVES[0]!.id);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 2000); return () => clearInterval(t); }, []);
  const hive = HIVES.find((h) => h.id === sel)!;
  const spec = useMemo(() => spectrum(hive).map((d) => ({ ...d, a: Math.max(0, d.a + ((tick * 7 + d.f) % 11) - 5) })), [hive, tick]);
  const hist = useMemo(() => history(hive), [hive]);
  const counts = { queenright: HIVES.filter((h) => h.status === "queenright").length, queenless: HIVES.filter((h) => h.status === "queenless").length, uncertain: HIVES.filter((h) => h.status === "uncertain").length };
  const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" } };

  return (
    <div className="min-h-screen honeycomb-bg">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-10 rounded-lg bg-primary text-primary-foreground"><Hexagon className="size-5" /></div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">HiveSense</h1>
              <p className="text-xs text-muted-foreground">Acoustic queen detection · {HIVES.length} hives</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative size-2 rounded-full bg-success text-success live-dot" /> Live
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={<Hexagon className="size-4" />} label="Total hives" value={HIVES.length} />
          <Stat icon={<Crown className="size-4" />} label="Queen present" value={counts.queenright} tone="text-success" />
          <Stat icon={<AlertTriangle className="size-4" />} label="Queenless" value={counts.queenless} tone="text-destructive" />
          <Stat icon={<Activity className="size-4" />} label="Uncertain" value={counts.uncertain} tone="text-warning" />
        </section>

        {counts.queenless > 0 && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Action needed: {HIVES.filter((h) => h.status === "queenless").map((h) => h.name.split(" · ")[0]).join(", ")} likely queenless</p>
              <p className="text-muted-foreground">Raised pitch (~300+ Hz) and "piping/roar" patterns detected. Inspect and consider requeening.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hives</h2>
            {HIVES.map((h) => (
              <button key={h.id} onClick={() => setSel(h.id)}
                className={`w-full text-left rounded-xl border p-4 transition-colors bg-card ${sel === h.id ? "border-primary" : "border-border hover:border-primary/50"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{h.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS[h.status].cls}`}>{STATUS[h.status].label}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${h.status === "queenright" ? "bg-success" : h.status === "queenless" ? "bg-destructive" : "bg-warning"}`} style={{ width: `${h.confidence}%` }} />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{h.confidence}%</span>
                </div>
                <div className="mt-2 flex gap-4 font-mono text-xs text-muted-foreground">
                  <span>{h.freq} Hz</span><span>{h.db} dB</span><span>{h.temp}°C</span><span className="ml-auto">{h.lastSeen} ago</span>
                </div>
              </button>
            ))}
          </section>

          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">{hive.device}</p>
                  <h2 className="text-2xl font-bold">{hive.name}</h2>
                </div>
                <div className={`rounded-xl border px-4 py-3 ${STATUS[hive.status].cls}`}>
                  <div className="flex items-center gap-2 font-semibold"><Crown className="size-4" />{STATUS[hive.status].label}</div>
                  <p className="text-xs opacity-80">Model confidence {hive.confidence}%</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Mini icon={<Mic className="size-4" />} label="Dominant freq" value={`${hive.freq} Hz`} />
                <Mini icon={<Activity className="size-4" />} label="Sound level" value={`${hive.db} dB`} />
                <Mini icon={<Thermometer className="size-4" />} label="Temperature" value={`${hive.temp}°C`} />
                <Mini icon={<Battery className="size-4" />} label="Battery" value={`${hive.battery}%`} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Live frequency spectrum</h3>
                <span className="text-xs text-muted-foreground">Queenright ≈ 200–270 Hz · Queenless ≈ 300+ Hz</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={spec}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="f" stroke="var(--muted-foreground)" fontSize={11} unit="Hz" />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip {...tip} cursor={{ fill: "var(--accent)" }} />
                    <Bar dataKey="a" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Last 24 hours</h3>
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={hist}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip {...tip} />
                    <Area dataKey="conf" name="Confidence %" stroke="var(--chart-4)" fill="url(#g2)" />
                    <Area dataKey="db" name="Sound dB" stroke="var(--primary)" fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Cpu className="size-4" /> Device health</h3>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <Mini icon={<Wifi className="size-4" />} label="WiFi signal" value={`${hive.rssi} dBm`} />
                <Mini icon={<Mic className="size-4" />} label="Mic sample rate" value="16 kHz" />
                <Mini icon={<Activity className="size-4" />} label="Last upload" value={`${hive.lastSeen} ago`} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, tone = "text-primary" }: { icon: React.ReactNode; label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={`flex items-center gap-2 text-xs text-muted-foreground`}><span className={tone}>{icon}</span>{label}</div>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}
