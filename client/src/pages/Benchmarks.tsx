import { CodeBlock } from "@/components/CodeBlock";
import { Card } from "@/components/ui/card";
import { NOT_BENCHMARKED, SIZE_TABLE, SPEED_TABLES, type BenchmarkTable } from "@/data/benchmarks";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { lazy, Suspense } from "react";

const LiveBenchmark = lazy(() => import("@/components/LiveBenchmark"));

function Table({ table }: { table: BenchmarkTable }) {
  return (
    <Card id={table.id} className="scroll-mt-20 gap-4 p-6">
      <div>
        <h3 className="text-xl font-semibold">{table.title}</h3>
        <p className="text-sm text-muted-foreground">{table.method}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              {table.columns.map((c, i) => (
                <th key={c} className={cn("whitespace-nowrap py-2 pr-4 font-medium", i === 0 ? "text-left" : "text-right")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr
                key={row[0]}
                className={cn("border-b border-border/50 last:border-0", table.highlight.includes(r) && "font-semibold text-primary")}
              >
                {row.map((cell, i) => (
                  <td key={i} className={cn("py-2 pr-4", i === 0 ? "text-left" : "whitespace-nowrap text-right tabular-nums")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.notes?.map((note) => (
        <p key={note} className="text-sm text-muted-foreground">
          {note}
        </p>
      ))}
      <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
        <dt className="font-medium text-foreground">Library</dt>
        <dd>{table.library}</dd>
        <dt className="font-medium text-foreground">Machine</dt>
        <dd>{table.machine}</dd>
        <dt className="font-medium text-foreground">Measured</dt>
        <dd>{table.date}</dd>
        <dt className="font-medium text-foreground">Source</dt>
        <dd>
          <a href={table.source} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {table.source.replace("https://github.com/", "")}
          </a>
        </dd>
      </dl>
      {table.reproduce && <CodeBlock lang="bash" code={table.reproduce} />}
    </Card>
  );
}

export default function Benchmarks() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-12">
        <header>
          <h1 className="mb-4 flex items-center gap-3 text-4xl font-bold">
            <BarChart3 className="h-10 w-10 text-primary" />
            Benchmarks
          </h1>
          <p className="text-lg text-muted-foreground">
            Every number on this page was measured and is published in the README of the library it belongs to,
            with the machine and the method. The live benchmark at the bottom runs in your browser.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Size</h2>
          <p className="text-muted-foreground">
            Size is where BTOON helps. All libraries write the same bytes for the same value, so these sizes hold for every
            language.
          </p>
          <Table table={SIZE_TABLE} />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Speed</h2>
          <p className="text-muted-foreground">
            Speed depends on the implementation, not the format. In Python, JavaScript and Go, BTOON is about as fast as
            the JSON or MessagePack library it is compared with, and faster in some cases. The Node.js native addon is
            the exception: it is slower than pure JavaScript, so in Node.js @btoon/js is the faster choice. The datasets
            differ between libraries, so compare within a table, not across tables.
          </p>
          <div className="space-y-6">
            {SPEED_TABLES.map((t) => (
              <Table key={t.id} table={t} />
            ))}
          </div>
          {NOT_BENCHMARKED.length > 0 && (
            <p className="text-sm text-muted-foreground">Not benchmarked yet: {NOT_BENCHMARKED.join(", ")}.</p>
          )}
        </section>

        <section id="live" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold">Live benchmark</h2>
          <p className="text-muted-foreground">
            Measured in your browser, with @btoon/js (the pure TypeScript library that also runs the playground),
            @msgpack/msgpack and the browser's JSON.
          </p>
          <Suspense fallback={<Card className="h-40 p-6" aria-busy="true" />}>
            <LiveBenchmark />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
