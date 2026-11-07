import { CodeBlock } from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SIZE_TABLE } from "@/data/benchmarks";
import { PACKAGES } from "@/data/packages";
import { cn } from "@/lib/utils";
import { Binary, Clock, Code, Download, Layers, Lock, ShieldCheck, Table2, Zap } from "lucide-react";
import { Link } from "wouter";

const FEATURES = [
  {
    icon: Table2,
    title: "Tables write each key once",
    text: "Arrays of objects with the same keys are stored column by column. Encoders switch to this layout only when it is smaller, by a fixed size rule, so every library makes the same choice.",
  },
  {
    icon: Binary,
    title: "Canonical bytes",
    text: "Smallest integer forms, float64, and keys sorted by UTF-8 bytes. One value has one encoding in every language, so encodings can be hashed, cached and signed.",
  },
  {
    icon: ShieldCheck,
    title: "Safe on hostile input",
    text: "Bounds-checked reads, a nesting limit, no allocation beyond what the input justifies, strict UTF-8 and capped decompression. The C++ core is fuzzed and tested under sanitizers.",
  },
  {
    icon: Layers,
    title: "MessagePack underneath",
    text: "Every BTOON document is valid MessagePack. BTOON's own types are extension types, and with the tabular encoding off the output is plain canonical MessagePack.",
  },
  {
    icon: Clock,
    title: "More types",
    text: "Timestamps with nanoseconds and an optional UTC offset, dates, arbitrary-size integers, and packed float32/float64 vectors for embeddings.",
  },
  {
    icon: Lock,
    title: "Compression and signing",
    text: "An optional envelope compresses with zlib (LZ4, Zstandard, Brotli and Snappy where available). Another one signs with HMAC-SHA256, verified before parsing.",
  },
];

export default function Home() {
  return (
    <>
      <section className="container py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-6">
              Spec 0.1 · MessagePack-compatible
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              MessagePack, with tables that store each key once
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              BTOON is a binary serialization format: MessagePack plus a columnar encoding for arrays of
              uniform objects, a few extra types, and optional compression and signing. On record-shaped
              data it is typically <strong className="text-foreground">35–45% smaller than MessagePack</strong>{" "}
              before compression, and every library writes the same bytes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/docs">
                  <Code className="h-5 w-5" />
                  Get started
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs#playground">
                  <Zap className="h-5 w-5" />
                  Try the playground
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/downloads">
                  <Download className="h-5 w-5" />
                  Downloads
                </Link>
              </Button>
            </div>
          </div>

          <Card className="gap-3 p-6">
            <div className="text-sm text-muted-foreground">JavaScript, with @btoon/js</div>
            <CodeBlock
              lang="javascript"
              code={`import { encode, decode } from "@btoon/js";

const users = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: \`User\${i}\`,
  email: \`user\${i}@example.com\`,
}));

const bytes = encode(users); // 2,734 bytes
decode(bytes);               // the same 100 objects

// MessagePack: 4,183 bytes. Minified JSON: 5,471 bytes.`}
            />
          </Card>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Why BTOON</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="gap-3 p-6">
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <h2 className="mb-4 text-center text-3xl font-bold">Size, measured</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">{SIZE_TABLE.method}</p>
        <Card className="mx-auto max-w-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {SIZE_TABLE.columns.map((c, i) => (
                    <th key={c} className={cn("px-4 py-3", i === 0 ? "text-left" : "text-right")}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.rows.map((row, r) => (
                  <tr key={row[0]} className="border-b border-border/50 last:border-0">
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-4 py-3",
                          i === 0 ? "text-left" : "text-right tabular-nums",
                          SIZE_TABLE.highlight.includes(r) ? "font-semibold text-primary" : "text-muted-foreground"
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            From the{" "}
            <a href={SIZE_TABLE.source} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              btoon-core README
            </a>
            . Speed measurements for every library are on the{" "}
            <Link href="/benchmarks" className="text-primary hover:underline">
              benchmarks page
            </Link>
            .
          </p>
        </Card>
      </section>

      <section className="container py-16">
        <h2 className="mb-4 text-center text-3xl font-bold">Libraries</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
          Every library passes the same conformance vectors from btoon-core and writes byte-identical output.
          The{" "}
          <Link href="/downloads" className="text-primary hover:underline">
            downloads page
          </Link>{" "}
          has the install command for each one.
        </p>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <Card key={p.id} className="gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{p.language}</span>
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  {p.repo.replace("https://github.com/", "")}
                </a>
              </div>
              <code className="text-xs text-muted-foreground">{p.install ?? "Build from source with CMake"}</code>
              <p className="text-xs text-muted-foreground">{p.summary}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <Card className="mx-auto max-w-3xl gap-3 p-6">
          <h2 className="text-xl font-semibold">Where the name comes from</h2>
          <p className="text-sm text-muted-foreground">
            <a href="https://github.com/toon-format/toon#readme" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              TOON
            </a>{" "}
            (Token-Oriented Object Notation) is a text format for LLM prompts that writes a table's field names once
            instead of once per row. BTOON ("Binary TOON") applies the same idea to a binary, MessagePack-compatible
            format. It is not a binary encoding of TOON text, and since it is binary it is meant for storage and
            transport between programs, not for pasting into prompts.
          </p>
        </Card>
      </section>
    </>
  );
}
