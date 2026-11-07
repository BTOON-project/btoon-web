import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { timeIt, utf8Length } from "@/lib/analyze";
import { DEFAULT_DATASET } from "@/lib/datasets";
import { formatBytes, formatMs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { decode, encode, VERSION } from "@btoon/js";
import { decode as msgpackDecode, encode as msgpackEncode } from "@msgpack/msgpack";
import { Gauge, Loader2 } from "lucide-react";
import { useState } from "react";

const SIZES = [1_000, 10_000] as const;

interface Row {
  name: string;
  bytes: number;
  encode: number;
  decode: number;
  btoon: boolean;
}

type State =
  | { status: "idle" }
  | { status: "running"; step: string }
  | { status: "done"; rows: Row[]; records: number; when: string; agent: string }
  | { status: "error"; message: string };

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 20));

export default function LiveBenchmark() {
  const [records, setRecords] = useState<number>(SIZES[1]);
  const [state, setState] = useState<State>({ status: "idle" });

  const run = async () => {
    try {
      setState({ status: "running", step: "Generating data" });
      await nextTick();
      const value = DEFAULT_DATASET.generate(records);
      const btoon = encode(value);
      const plain = encode(value, { autoTabular: false });
      const msgpack = msgpackEncode(value);
      const json = JSON.stringify(value);
      const cases = [
        { name: `BTOON, @btoon/js ${VERSION}`, bytes: btoon.length, enc: () => encode(value), dec: () => decode(btoon), btoon: true },
        { name: "BTOON, tabular off", bytes: plain.length, enc: () => encode(value, { autoTabular: false }), dec: () => decode(plain), btoon: true },
        { name: "MessagePack, @msgpack/msgpack", bytes: msgpack.length, enc: () => msgpackEncode(value), dec: () => msgpackDecode(msgpack), btoon: false },
        { name: "JSON.stringify / JSON.parse", bytes: utf8Length(json), enc: () => JSON.stringify(value), dec: () => JSON.parse(json), btoon: false },
      ];
      const rows: Row[] = [];
      for (const c of cases) {
        setState({ status: "running", step: `Timing ${c.name}` });
        await nextTick();
        const encodeMs = timeIt(c.enc, 7, 20, 3_000);
        await nextTick();
        const decodeMs = timeIt(c.dec, 7, 20, 3_000);
        rows.push({ name: c.name, bytes: c.bytes, encode: encodeMs, decode: decodeMs, btoon: c.btoon });
      }
      setState({ status: "done", rows, records, when: new Date().toLocaleString(), agent: navigator.userAgent });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  };

  const running = state.status === "running";

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Label>Records</Label>
          <div className="flex gap-2">
            {SIZES.map((n) => (
              <Button key={n} size="sm" variant={n === records ? "default" : "outline"} onClick={() => setRecords(n)} disabled={running}>
                {n.toLocaleString("en-US")}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={run} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
          {running ? state.step : "Run in this browser"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Encodes and decodes {records.toLocaleString("en-US")} employee records ({DEFAULT_DATASET.description.replace(/^HR records: /, "")}).
        Each number is the median of 7 rounds of at least 20 ms after a warm-up. The page is busy for a few seconds.
      </p>

      {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}

      {state.status === "done" && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 text-left font-medium">Format, library</th>
                  <th className="py-2 pr-4 text-right font-medium">Size</th>
                  <th className="py-2 pr-4 text-right font-medium">Encode</th>
                  <th className="py-2 text-right font-medium">Decode</th>
                </tr>
              </thead>
              <tbody>
                {state.rows.map((row) => (
                  <tr key={row.name} className={cn("border-b border-border/50 last:border-0", row.btoon && "text-primary")}>
                    <td className="py-2 pr-4">{row.name}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatBytes(row.bytes)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatMs(row.encode)}</td>
                    <td className="py-2 text-right tabular-nums">{formatMs(row.decode)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Measured in your browser on {state.when}, {state.records.toLocaleString("en-US")} records. {state.agent}
          </p>
        </div>
      )}
    </Card>
  );
}
