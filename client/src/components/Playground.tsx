import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyze, btoonZlibSize, measure, zlibSize, type Analysis, type Compressed, type Timings } from "@/lib/analyze";
import { DATASETS, DEFAULT_DATASET } from "@/lib/datasets";
import { formatBytes, formatChange, formatMs, hexDump, parseBinary, toHex } from "@/lib/format";
import { inspectEnvelope, type Envelope } from "@/lib/inspect";
import { cn } from "@/lib/utils";
import { toDisplay } from "@/lib/values";
import { BtoonError, decode } from "@btoon/js";
import { AlertTriangle, Check, Copy, Download, FileInput, Gauge, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const MAX_RECORDS = 1000;
const DEFAULT_RECORDS = 100;
const MAX_SHOWN_TEXT = 200_000;

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

function errorText(e: unknown): string {
  if (e instanceof BtoonError) return `${e.code}: ${e.message}`;
  return e instanceof Error ? e.message : String(e);
}

function clip(text: string): string {
  return text.length > MAX_SHOWN_TEXT ? `${text.slice(0, MAX_SHOWN_TEXT)}\n… (${(text.length - MAX_SHOWN_TEXT).toLocaleString("en-US")} more characters)` : text;
}

type EncodeResult = { ok: true; value: unknown; analysis: Analysis } | { ok: false; message: string };
type CompressedSizes = { btoon: Compressed; json: Compressed };

export default function Playground() {
  const [tab, setTab] = useState("encode");
  const [datasetId, setDatasetId] = useState<string | null>(DEFAULT_DATASET.id);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [input, setInput] = useState(() => pretty(DEFAULT_DATASET.generate(DEFAULT_RECORDS)));
  const [autoTabular, setAutoTabular] = useState(true);
  const [result, setResult] = useState<EncodeResult | null>(null);
  const [compressed, setCompressed] = useState<CompressedSizes | null>(null);
  const [timings, setTimings] = useState<Timings | null>(null);
  const [timing, setTiming] = useState(false);
  const [binaryInput, setBinaryInput] = useState("");

  const dataset = DATASETS.find((d) => d.id === datasetId) ?? null;

  const chooseDataset = (id: string) => {
    const next = DATASETS.find((d) => d.id === id) ?? DEFAULT_DATASET;
    setDatasetId(next.id);
    setInput(pretty(next.generate(records)));
  };

  // Encode whenever the input or the tabular setting changes (debounced while typing).
  useEffect(() => {
    let cancelled = false;
    setTimings(null);
    const timer = setTimeout(() => {
      let value: unknown;
      try {
        value = JSON.parse(input);
      } catch (e) {
        setResult({ ok: false, message: `Invalid JSON: ${errorText(e)}` });
        setCompressed(null);
        return;
      }
      let analysis: Analysis;
      try {
        analysis = analyze(value, autoTabular);
      } catch (e) {
        setResult({ ok: false, message: errorText(e) });
        setCompressed(null);
        return;
      }
      setResult({ ok: true, value, analysis });
      setCompressed(null);
      Promise.all([
        btoonZlibSize(value, autoTabular, analysis.btoon.length),
        zlibSize(new TextEncoder().encode(JSON.stringify(value))),
      ]).then(
        ([btoon, json]) => {
          if (!cancelled) setCompressed({ btoon, json });
        },
        (e: unknown) => {
          if (!cancelled) setCompressed({ btoon: { unavailable: errorText(e) }, json: { unavailable: errorText(e) } });
        }
      );
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input, autoTabular]);

  const runTimings = () => {
    if (!result?.ok) return;
    setTiming(true);
    // Let the spinner paint before the main thread is busy.
    setTimeout(() => {
      try {
        setTimings(measure(result.value, autoTabular));
      } finally {
        setTiming(false);
      }
    }, 30);
  };

  const decoded = useMemo(() => {
    if (!binaryInput.trim()) return null;
    try {
      const bytes = parseBinary(binaryInput);
      const envelope = inspectEnvelope(bytes);
      const value = decode(bytes, { timestamps: "object" });
      return { ok: true as const, bytes, envelope, text: clip(pretty(toDisplay(value))) };
    } catch (e) {
      return { ok: false as const, message: errorText(e) };
    }
  }, [binaryInput]);

  const openInDecoder = (bytes: Uint8Array) => {
    setBinaryInput(toHex(bytes));
    setTab("decode");
  };

  return (
    <div className="space-y-6 not-prose">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="encode">Encode JSON</TabsTrigger>
          <TabsTrigger value="decode">Decode BTOON</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="mt-4 space-y-6">
          <Card className="gap-5 p-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Example data">
              {DATASETS.map((d) => (
                <Button
                  key={d.id}
                  size="sm"
                  variant={d.id === datasetId ? "default" : "outline"}
                  onClick={() => chooseDataset(d.id)}
                  title={d.description}
                >
                  {d.name}
                </Button>
              ))}
              {datasetId === null && <Badge variant="secondary" className="self-center">Custom input</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {dataset ? dataset.description : "Your own JSON. Pick an example to replace it."}
            </p>
            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label htmlFor="records">Records</Label>
                  <span className="tabular-nums text-muted-foreground">{records.toLocaleString("en-US")}</span>
                </div>
                <Slider
                  id="records"
                  min={1}
                  max={MAX_RECORDS}
                  step={1}
                  value={[records]}
                  disabled={!dataset}
                  onValueChange={([n]) => setRecords(n)}
                  onValueCommit={([n]) => dataset && setInput(pretty(dataset.generate(n)))}
                  aria-label="Number of records"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="tabular" checked={autoTabular} onCheckedChange={setAutoTabular} />
                <Label htmlFor="tabular">Tabular encoding (autoTabular)</Label>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="gap-3 p-5">
              <Label htmlFor="json-input" className="text-base font-semibold">
                Input (JSON)
              </Label>
              <Textarea
                id="json-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setDatasetId(null);
                }}
                spellCheck={false}
                className="h-[420px] resize-y font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Sizes compare minified JSON, so the formatting here doesn't count.
              </p>
            </Card>

            <Card className="gap-4 p-5">
              <h3 className="text-base font-semibold">Encoded sizes</h3>
              {result === null && <p className="text-sm text-muted-foreground">Encoding…</p>}
              {result && !result.ok && <ErrorBox message={result.message} />}
              {result?.ok && <SizeReport analysis={result.analysis} compressed={compressed} autoTabular={autoTabular} />}
            </Card>
          </div>

          {result?.ok && (
            <>
              <Card className="gap-4 p-5">
                <Tabs defaultValue="hex">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <TabsList>
                      <TabsTrigger value="hex">Hex</TabsTrigger>
                      <TabsTrigger value="decoded">Decoded</TabsTrigger>
                    </TabsList>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton text={toHex(result.analysis.btoon)} label="Copy hex" />
                      <Button size="sm" variant="outline" onClick={() => downloadBytes(result.analysis.btoon)}>
                        <Download className="h-4 w-4" />
                        Download .btoon
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openInDecoder(result.analysis.btoon)}>
                        <FileInput className="h-4 w-4" />
                        Open in decoder
                      </Button>
                    </div>
                  </div>
                  <TabsContent value="hex" className="mt-3">
                    <pre className="max-h-[420px] overflow-auto rounded-md bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                      {hexDump(result.analysis.btoon)}
                    </pre>
                  </TabsContent>
                  <TabsContent value="decoded" className="mt-3">
                    <pre className="max-h-[420px] overflow-auto rounded-md bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                      {clip(pretty(toDisplay(result.analysis.decoded)))}
                    </pre>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Decoded with @btoon/js. Maps come back with their keys in UTF-8 byte order, the canonical order.
                    </p>
                  </TabsContent>
                </Tabs>
              </Card>

              <Card className="gap-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">Speed in this browser</h3>
                  <Button size="sm" variant="outline" onClick={runTimings} disabled={timing}>
                    {timing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
                    {timings ? "Measure again" : "Measure"}
                  </Button>
                </div>
                {timings ? (
                  <TimingTable timings={timings} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Times encode and decode of the current input with @btoon/js, @msgpack/msgpack and the built-in JSON,
                    here in your browser. The page is busy for up to a few seconds while it runs.
                  </p>
                )}
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="decode" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="binary-input" className="text-base font-semibold">
                  BTOON bytes (hex or base64)
                </Label>
                {binaryInput && (
                  <Button size="sm" variant="ghost" onClick={() => setBinaryInput("")}>
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
              <Textarea
                id="binary-input"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                spellCheck={false}
                placeholder="83a6616374697665c3a3616765 1ea46e616d65a5416c696365"
                className="h-[420px] resize-y font-mono text-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setBinaryInput("83a6616374697665c3a36167651ea46e616d65a5416c696365")}>
                  Load the spec example
                </Button>
                {result?.ok && (
                  <Button size="sm" variant="outline" onClick={() => openInDecoder(result.analysis.btoon)}>
                    Use the encoded output
                  </Button>
                )}
              </div>
            </Card>

            <Card className="gap-3 p-5">
              <h3 className="text-base font-semibold">Decoded</h3>
              {decoded === null && (
                <p className="text-sm text-muted-foreground">
                  Paste bytes to decode them with @btoon/js. Decoding is strict, as the spec requires: invalid UTF-8,
                  duplicate keys and trailing bytes are errors, and every error has a code.
                </p>
              )}
              {decoded && !decoded.ok && <ErrorBox message={decoded.message} />}
              {decoded?.ok && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(decoded.bytes.length)} · {describeEnvelope(decoded.envelope)}
                  </p>
                  <pre className="max-h-[420px] overflow-auto rounded-md bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                    {decoded.text}
                  </pre>
                  <p className="text-xs text-muted-foreground">
                    Types JSON lacks are shown in the "$"-tagged form of the btoon CLI, such as{" "}
                    <code>{'{"$binary": "<base64>"}'}</code> or <code>{'{"$bigint": "<decimal>"}'}</code>.
                  </p>
                </>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function describeEnvelope(envelope: Envelope): string {
  switch (envelope.kind) {
    case "compressed":
      return `${envelope.algorithm} compression envelope, ${formatBytes(envelope.compressedSize)} → ${formatBytes(envelope.uncompressedSize)}`;
    case "signed":
      return "signed envelope";
    default:
      return "bare document, no envelope";
  }
}

type SizeRow = { label: string; bytes?: number; note?: string; btoon?: boolean };

const JSON_LABEL = "JSON (minified)";

function compressedRow(label: string, c: Compressed | undefined, btoon = false): SizeRow {
  if (c === undefined) return { label, note: "compressing…", btoon };
  if ("bytes" in c) return { label, bytes: c.bytes, btoon };
  return { label, note: "skipped" in c ? c.skipped : c.unavailable, btoon };
}

function SizeReport({ analysis, compressed, autoTabular }: { analysis: Analysis; compressed: CompressedSizes | null; autoTabular: boolean }) {
  const { jsonBytes, msgpackBytes, btoon, btoonTabularBytes, btoonPlainBytes, roundTrip } = analysis;
  const rows: SizeRow[] = [
    { label: JSON_LABEL, bytes: jsonBytes },
    compressedRow("JSON + zlib", compressed?.json),
    { label: "MessagePack (@msgpack/msgpack)", bytes: msgpackBytes },
    { label: autoTabular ? "BTOON (@btoon/js)" : "BTOON, tabular off", bytes: btoon.length, btoon: true },
    compressedRow("BTOON + zlib envelope", compressed?.btoon, true),
  ];
  const max = Math.max(jsonBytes, msgpackBytes, btoon.length, 1);

  let tabularNote: string;
  if (!autoTabular) {
    tabularNote = `The tabular encoding is off, so this is plain canonical MessagePack. With it on, BTOON would be ${formatBytes(btoonTabularBytes)}.`;
  } else if (btoonTabularBytes < btoonPlainBytes) {
    tabularNote = `The tabular encoding saved ${formatBytes(btoonPlainBytes - btoonTabularBytes)} (${formatChange(btoonTabularBytes, btoonPlainBytes)}) against BTOON's plain MessagePack layout.`;
  } else {
    tabularNote = "No array here qualifies for the tabular encoding, or it wouldn't be smaller, so BTOON wrote plain canonical MessagePack.";
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
              <span className={cn(row.btoon && "font-semibold text-primary")}>{row.label}</span>
              {row.bytes !== undefined ? (
                <span className="tabular-nums text-muted-foreground">
                  <span className={cn(row.btoon && "font-semibold text-foreground")}>{formatBytes(row.bytes)}</span>
                  {row.label !== JSON_LABEL && <> · {formatChange(row.bytes, jsonBytes)} vs JSON</>}
                  {row.btoon && <> · {formatChange(row.bytes, msgpackBytes)} vs MessagePack</>}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{row.note}</span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              {row.bytes !== undefined && (
                <div
                  className={cn("h-full rounded-full", row.btoon ? "bg-primary" : "bg-muted-foreground/50")}
                  style={{ width: `${Math.max(0.5, (row.bytes / max) * 100)}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{tabularNote}</p>
      <div
        className={cn(
          "flex items-start gap-2 rounded-md border p-3 text-sm",
          roundTrip ? "border-emerald-500/30 bg-emerald-500/10" : "border-destructive/30 bg-destructive/10"
        )}
      >
        {roundTrip ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        )}
        <span>
          {roundTrip
            ? "Round trip OK: decoding the BTOON bytes gives back a value equal to the input."
            : "Round trip mismatch: the decoded value differs from the input. Please report this with the input."}
        </span>
      </div>
    </div>
  );
}

function TimingTable({ timings }: { timings: Timings }) {
  const rows = [
    ["BTOON (@btoon/js)", timings.btoonEncode, timings.btoonDecode],
    ["MessagePack (@msgpack/msgpack)", timings.msgpackEncode, timings.msgpackDecode],
    ["JSON (stringify / parse)", timings.jsonStringify, timings.jsonParse],
  ] as const;
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-4 text-left font-medium">Library</th>
              <th className="py-2 pr-4 text-right font-medium">Encode</th>
              <th className="py-2 text-right font-medium">Decode</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, enc, dec]) => (
              <tr key={name} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-4">{name}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{formatMs(enc)}</td>
                <td className="py-2 text-right tabular-nums">{formatMs(dec)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Median of 5 rounds after a warm-up, measured just now in this tab. Results vary with the browser, the device and
        whatever else is running.
      </p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <span className="break-all">{message}</span>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  };
  return (
    <Button size="sm" variant="outline" onClick={copy}>
      {state === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {state === "failed" ? "Copy failed" : label}
    </Button>
  );
}

function downloadBytes(bytes: Uint8Array) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.btoon";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
