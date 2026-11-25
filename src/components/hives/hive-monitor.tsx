import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WifiOff, Activity, Crown, Cpu, Mic, Thermometer, Wifi, Battery } from "lucide-react";
import { HIVES, STATUS, type Hive } from "@/lib/hives";

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

export function HiveMonitor({ selectedId = "H1" }: { selectedId?: string }) {
  const [tick, setTick] = useState(0);
  const hive = HIVES.find((h) => h.id === selectedId) ?? HIVES[0];
  const connected = hive?.status !== "offline";
  useEffect(() => {
    if (!connected) return;
    const timer = setInterval(() => setTick((x) => x + 1), 2000);
    return () => clearInterval(timer);
  }, [connected]);
  const spec = useMemo(() => (!hive || !connected ? [] : spectrum(hive).map((d) => ({ ...d, a: Math.max(0, d.a + ((tick * 7 + d.f) % 11) - 5) }))), [hive, tick, connected]);
  const hist = useMemo(() => (!hive || !connected ? [] : history(hive)), [hive, connected]);
  if (!hive) return null;
  const offline = hive.status === "offline";
  const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" } };

  return (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hives</h2>
            {HIVES.map((h) => (
              <Link key={h.id} to="/hives/$hiveId" params={{ hiveId: h.id }}
                className={`w-full text-left rounded-lg border p-4 transition-colors bg-card ${selectedId === h.id ? "border-primary" : "border-border hover:border-primary/50"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{h.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS[h.status].cls}`}>{STATUS[h.status].label}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {h.status === "offline" ? (
                    <span className="font-mono text-xs text-muted-foreground">No confidence reading</span>
                  ) : (
                    <>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${h.status === "queenright" ? "bg-success" : "bg-destructive"}`} style={{ width: `${h.confidence}%` }} />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{h.confidence}%</span>
                    </>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
                  {h.status === "offline" ? <span>No signal from node</span> : <><span>{h.freq} Hz</span><span>{h.db} dB</span><span>{h.temp}°C</span></>}<span className="ml-auto">{h.lastSeen} ago</span>
                </div>
              </Link>
            ))}
          </section>

          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">{hive.device}</p>
                  <h2 className="text-2xl font-bold">{hive.name}</h2>
                </div>
                <div className={`rounded-lg border px-4 py-3 ${STATUS[hive.status].cls}`}>
                  <div className="flex items-center gap-2 font-semibold">{offline ? <WifiOff className="size-4" /> : <Crown className="size-4" />}{STATUS[hive.status].label}</div>
                  <p className="text-xs opacity-80">{offline ? "Awaiting data from node" : `Model confidence ${hive.confidence}%`}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Mini icon={<Mic className="size-4" />} label="Dominant freq" value={offline ? "No signal" : `${hive.freq} Hz`} />
                <Mini icon={<Activity className="size-4" />} label="Sound level" value={offline ? "No signal" : `${hive.db} dB`} />
                <Mini icon={<Thermometer className="size-4" />} label="Temperature" value={offline ? "No signal" : `${hive.temp}°C`} />
                <Mini icon={<Battery className="size-4" />} label="Battery" value={offline ? "No signal" : `${hive.battery}%`} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="font-semibold">Live frequency spectrum</h3>
                <span className="text-xs text-muted-foreground">Queenright ≈ 200–270 Hz · Queenless ≈ 300+ Hz</span>
              </div>
              <div className="h-56">
                {offline ? (
                  <NoSignal note={`No audio received from ${hive.device}. Last seen ${hive.lastSeen} ago.`} />
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={spec}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="f" stroke="var(--muted-foreground)" fontSize={11} unit="Hz" />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                      <Tooltip {...tip} cursor={{ fill: "var(--accent)" }} />
                      <Bar dataKey="a" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Last 24 hours</h3>
              <div className="h-56">
                {offline ? (
                  <NoSignal note={`No readings stored for ${hive.device} while it was offline.`} />
                ) : (
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
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Cpu className="size-4" /> Device health</h3>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <Mini icon={<Wifi className="size-4" />} label="WiFi signal" value={offline ? "No signal" : `${hive.rssi} dBm`} />
                <Mini icon={<Mic className="size-4" />} label="Mic sample rate" value={offline ? "No signal" : "16 kHz"} />
                <Mini icon={<Activity className="size-4" />} label="Last upload" value={`${hive.lastSeen} ago`} />
              </div>
            </div>
          </section>
        </div>

  );
}

function NoSignal({ note }: { icon?: never; note: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-6 text-center">
      <WifiOff className="size-6 text-muted-foreground" />
      <p className="font-semibold">No signal</p>
      <p className="text-xs text-muted-foreground max-w-sm">{note}</p>
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
