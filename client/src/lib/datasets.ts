/** Deterministic example data for the playground and the live benchmark. */

// mulberry32: small, fast, and the same sequence in every browser.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (x: number, digits: number) => Number(x.toFixed(digits));
const pick = <T,>(items: readonly T[], r: () => number) => items[Math.floor(r() * items.length)];

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Support", "Finance"] as const;
const CATEGORIES = ["Electronics", "Clothing", "Books", "Garden", "Food"] as const;
const METHODS = ["GET", "GET", "GET", "POST", "PUT", "DELETE"] as const;
const STATUSES = [200, 200, 200, 201, 204, 304, 400, 404, 500] as const;
const BASE_MS = Date.UTC(2026, 0, 1); // 2026-01-01T00:00:00Z

export interface Dataset {
  id: string;
  name: string;
  description: string;
  /** Whether the generated value is an array of uniform records (tabular-friendly). */
  tabular: boolean;
  generate(count: number): unknown;
}

export const DATASETS: readonly Dataset[] = [
  {
    id: "employees",
    name: "Employees",
    description: "HR records: id, name, email, department, salary, active",
    tabular: true,
    generate(count) {
      const r = rng(1);
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@example.com`,
        department: pick(DEPARTMENTS, r),
        salary: 40_000 + Math.floor(r() * 80) * 1_000,
        active: r() > 0.2,
      }));
    },
  },
  {
    id: "products",
    name: "Products",
    description: "Catalog rows with prices as floats",
    tabular: true,
    generate(count) {
      const r = rng(2);
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        sku: `SKU-${String(i + 1).padStart(5, "0")}`,
        name: `Product ${i + 1}`,
        category: pick(CATEGORIES, r),
        price: round(5 + r() * 195, 2),
        stock: Math.floor(r() * 500),
      }));
    },
  },
  {
    id: "sensors",
    name: "Sensor readings",
    description: "Time series: millisecond timestamps and float measurements",
    tabular: true,
    generate(count) {
      const r = rng(3);
      return Array.from({ length: count }, (_, i) => ({
        sensor: `s-${(i % 8) + 1}`,
        ts: BASE_MS + i * 15_000,
        temperature: round(18 + r() * 8, 2),
        humidity: round(35 + r() * 30, 1),
        pressure: round(990 + r() * 40, 1),
      }));
    },
  },
  {
    id: "logs",
    name: "API logs",
    description: "Access log lines with short keys",
    tabular: true,
    generate(count) {
      const r = rng(4);
      return Array.from({ length: count }, (_, i) => ({
        t: BASE_MS + i * 1_250,
        method: pick(METHODS, r),
        path: `/api/v1/items/${1 + Math.floor(r() * 5_000)}`,
        status: pick(STATUSES, r),
        ms: Math.floor(r() * r() * 900) + 1,
      }));
    },
  },
  {
    id: "events",
    name: "Mixed events",
    description: "Records whose keys differ: not tabular, so BTOON is plain MessagePack",
    tabular: false,
    generate(count) {
      const r = rng(5);
      return Array.from({ length: count }, (_, i) => {
        const at = BASE_MS + i * 60_000;
        switch (i % 3) {
          case 0:
            return { type: "login", at, user: `user${1 + Math.floor(r() * 300)}`, mfa: r() > 0.5 };
          case 1:
            return { type: "purchase", at, order: 10_000 + i, total: round(r() * 300, 2), items: 1 + Math.floor(r() * 5) };
          default:
            return { type: "error", at, code: pick([400, 404, 500, 503], r), message: "upstream timeout", retry: r() > 0.3 };
        }
      });
    },
  },
];

export const DEFAULT_DATASET = DATASETS[0];
