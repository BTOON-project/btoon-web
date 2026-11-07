// Published measurements, copied from each library's README. Every table names its
// source, machine and date. Don't add numbers here that aren't in a README.

export interface BenchmarkTable {
  id: string;
  title: string;
  library: string;
  source: string;
  machine: string;
  date: string;
  method: string;
  columns: string[];
  rows: string[][];
  /** Rows (by index) that are BTOON, highlighted in the table. */
  highlight: number[];
  notes?: string[];
  reproduce?: string;
}

const GH = "https://github.com/BTOON-project";

export const SIZE_TABLE: BenchmarkTable = {
  id: "core-size",
  title: "Size: 200 user records",
  library: "btoon-core (C++)",
  source: `${GH}/btoon-core#size`,
  machine: "Not machine dependent",
  date: "2026-11-07",
  method: "200 user records (id, name, email, score, active) plus a small meta object.",
  columns: ["Encoding", "Bytes", "vs JSON"],
  rows: [
    ["JSON (minified)", "16,345", "100%"],
    ["MessagePack", "12,686", "77.6%"],
    ["BTOON", "7,166", "43.8%"],
    ["JSON + zlib", "2,228", "13.6%"],
    ["BTOON + zlib", "1,845", "11.3%"],
  ],
  highlight: [2, 4],
  notes: [
    "The saving comes from not repeating keys, so it grows with the number of rows and the length of the key names. Data that isn't tabular encodes exactly like MessagePack.",
  ],
};

export const SPEED_TABLES: readonly BenchmarkTable[] = [
  {
    id: "core-speed",
    title: "C++ (btoon-core)",
    library: "btoon-core 0.1.0",
    source: `${GH}/btoon-core#speed`,
    machine: "Apple M4 Max, Release build",
    date: "2026-11-07",
    method: "btoon_bench, 10,000 records, best of 7 runs.",
    columns: ["Case", "Size", "Encode", "Decode"],
    rows: [
      ["Records, tabular", "447 KB", "0.60 ms (741 MB/s)", "1.54 ms (291 MB/s)"],
      ["Records, plain", "767 KB", "0.69 ms (1.1 GB/s)", "2.05 ms (374 MB/s)"],
      ["Nested, mixed", "814 KB", "0.86 ms (943 MB/s)", "2.16 ms (378 MB/s)"],
    ],
    highlight: [],
    notes: ["Decoding builds a full btoon::Value tree (std::map, std::string), and that is where most of its time goes."],
    reproduce: "cmake -B build -DBUILD_BENCHMARKS=ON && cmake --build build && build/btoon_bench",
  },
  {
    id: "python",
    title: "Python",
    library: "btoon 0.1.0 (native extension)",
    source: `${GH}/btoon-python#why`,
    machine: "Apple M4 Max, Python 3.13",
    date: "2026-11-07",
    method: "10,000 records (id, name, email, age, score, active), best of 7.",
    columns: ["Library", "Size", "Encode", "Decode"],
    rows: [
      ["json", "1,138 KB", "4.16 ms", "3.68 ms"],
      ["msgpack 1.2 (C extension)", "767 KB", "1.81 ms", "3.20 ms"],
      ["btoon", "447 KB", "0.77 ms", "3.15 ms"],
    ],
    highlight: [2],
    notes: [
      "For nested, irregular data BTOON is canonical MessagePack, and its speed is close to msgpack's: 2.54 ms encode and 4.95 ms decode, against 2.42 and 4.32 ms.",
    ],
  },
  {
    id: "javascript",
    title: "JavaScript (@btoon/js)",
    library: "@btoon/js 0.1.0 (pure TypeScript)",
    source: `${GH}/btoon-javascript#performance`,
    machine: "Apple M4 Max, Node.js 22.22.2",
    date: "2026-11-07",
    method: "npm run bench, best of 7 rounds, Node.js entry point.",
    columns: ["Case", "BTOON size", "Encode", "Decode", "JSON size", "JSON.stringify", "JSON.parse"],
    rows: [
      ["10k records, tabular", "571,851 B", "1.54 ms", "2.92 ms", "1,242,300 B", "2.01 ms", "2.80 ms"],
      ["10k records, autoTabular: false", "941,744 B", "3.76 ms", "3.97 ms", "1,242,300 B", "2.01 ms", "2.81 ms"],
      ["2k nested objects", "177,644 B", "0.74 ms", "0.66 ms", "298,714 B", "0.63 ms", "0.96 ms"],
    ],
    highlight: [0],
    notes: [
      "The browser (portable) entry measured up to 6% slower on the same machine.",
      "Bundle size of the portable ESM entry (esbuild --minify): 44.1 KB, 14.7 KB gzipped. Importing only decode: 25.9 KB, 9.4 KB gzipped.",
    ],
    reproduce: "npm run bench",
  },
  {
    id: "nodejs",
    title: "Node.js native addon (btoon)",
    library: "btoon 0.1.0 (Node-API addon)",
    source: `${GH}/btoon-nodejs#performance`,
    machine: "Apple M4 Max, Node.js 22.22",
    date: "2026-11-07",
    method: "10,000 records (id, name, email, age, score, active), best of 15, same data for every library.",
    columns: ["Library", "Size", "Encode", "Decode"],
    rows: [
      ["btoon (native)", "447 KB", "7.8 ms", "7.1 ms"],
      ["@btoon/js 0.1.0 (pure TypeScript)", "447 KB", "1.1 ms", "1.6 ms"],
      ["@msgpack/msgpack 3.1 (pure JS)", "767 KB", "2.7 ms", "2.5 ms"],
      ["JSON", "1,018 KB", "1.5 ms", "1.9 ms"],
    ],
    highlight: [0, 1],
    notes: [
      "The native addon is the slowest here: every property access and object creation crosses the Node-API boundary. @btoon/js writes byte-identical output and is the faster choice in Node.js.",
    ],
  },
  {
    id: "go",
    title: "Go",
    library: "btoon-go 0.1.0",
    source: `${GH}/btoon-go#benchmarks`,
    machine: "Apple M4 Max (16 cores, 48 GiB), macOS 27.2, Go 1.27.3",
    date: "2026-11-07",
    method: "make bench (go test -bench=. -benchmem), median of 5. 1,000 records of a struct with seven fields.",
    columns: ["Operation", "btoon", "encoding/json"],
    rows: [
      ["Marshal", "272 µs, 559 KB, 1,030 allocs", "258 µs, 142 KB, 4 allocs"],
      ["Unmarshal into []struct", "438 µs, 738 KB, 15,769 allocs", "551 µs, 318 KB, 4,010 allocs"],
      ["Decode into dynamic values", "197 µs, 551 KB, 12,761 allocs", "not measured"],
      ["Marshal with zlib envelope", "516 µs, 1.7 MB, 1,055 allocs", "–"],
    ],
    highlight: [],
    notes: ["Encoded size of the same data: BTOON 51,508 B (tabular), 92,399 B with DisableTabular, 13,361 B in a zlib envelope; JSON 135,596 B."],
    reproduce: "make bench",
  },
  {
    id: "php",
    title: "PHP",
    library: "btoon/btoon 0.1.0 (pure PHP)",
    source: `${GH}/btoon-php#performance`,
    machine: "Apple M4 Max, PHP 8.5.12",
    date: "2026-11-07",
    method: "php bench/bench.php, 10,000 records (id, name, email, age, score, active), best of 7. JIT: opcache.jit=tracing.",
    columns: ["Library", "Size", "Encode", "Decode", "Encode, JIT", "Decode, JIT"],
    rows: [
      ["BTOON\\encode / decode", "447 KB", "5.5 ms", "5.8 ms", "3.7 ms", "3.7 ms"],
      ["auto_tabular => false", "767 KB", "7.3 ms", "12.3 ms", "4.8 ms", "6.0 ms"],
      ["json_encode / json_decode (C)", "1,018 KB", "2.1 ms", "3.6 ms", "2.2 ms", "3.6 ms"],
    ],
    highlight: [0],
    notes: ["JSON is a C extension and this library is pure PHP. The output is byte-identical to the Python library's for the same data."],
    reproduce: "php bench/bench.php",
  },
];

/** Libraries without published numbers yet. */
export const NOT_BENCHMARKED: readonly string[] = [];
