export type Status = "queenright" | "queenless" | "offline";
export type Hive = { id: string; name: string; device: string; status: Status; confidence: number; freq: number; db: number; temp: number; battery: number; rssi: number; lastSeen: string };

// Sample data — replace with live ESP32 readings
export const HIVES: Hive[] = [
  { id: "H1", name: "Hive 01 · Acacia", device: "esp32-a1f3", status: "queenright", confidence: 94, freq: 248, db: 62, temp: 34.8, battery: 87, rssi: -58, lastSeen: "12s" },
  { id: "H2", name: "Hive 02 · Meadow", device: "esp32-b72c", status: "queenless", confidence: 88, freq: 312, db: 71, temp: 33.1, battery: 64, rssi: -67, lastSeen: "8s" },
  { id: "H3", name: "Hive 03 · Orchard", device: "esp32-c09e", status: "queenright", confidence: 91, freq: 236, db: 59, temp: 35.0, battery: 92, rssi: -52, lastSeen: "20s" },
  { id: "H4", name: "Hive 04 · Ridge", device: "esp32-d4a8", status: "offline", confidence: 0, freq: 0, db: 0, temp: 0, battery: 0, rssi: 0, lastSeen: "3h" },
  { id: "H5", name: "Hive 05 · Riverbank", device: "esp32-e551", status: "queenright", confidence: 97, freq: 241, db: 60, temp: 34.9, battery: 78, rssi: -61, lastSeen: "5s" },
  { id: "H6", name: "Hive 06 · Hilltop", device: "esp32-f20b", status: "queenless", confidence: 82, freq: 325, db: 73, temp: 32.6, battery: 55, rssi: -70, lastSeen: "15s" },
];

export const STATUS = {
  queenright: { label: "Queen present", cls: "text-success bg-success/10 border-success/30" },
  queenless: { label: "Queenless", cls: "text-destructive bg-destructive/10 border-destructive/30" },
  offline: { label: "Node offline", cls: "text-muted-foreground bg-muted border-border" },
} as const;


export function pageHead(title: string, description: string) {
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}
