import { CodeBlock } from "@/components/CodeBlock";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PACKAGES } from "@/data/packages";
import { Book, Code2, Cpu, Loader2 } from "lucide-react";
import { lazy, Suspense, type ReactNode } from "react";
import { Link } from "wouter";

// The playground pulls in @btoon/js and @msgpack/msgpack: load it only on this page, on demand.
const Playground = lazy(() => import("@/components/Playground"));

const SPEC = "https://github.com/BTOON-project/btoon-core/blob/main/docs/SPEC.md";

const NAV: { title: string; icon: typeof Book; items: [string, string][] }[] = [
  {
    title: "Getting started",
    icon: Book,
    items: [
      ["introduction", "Introduction"],
      ["installation", "Installation"],
      ["playground", "Playground"],
      ["quick-start", "Quick start"],
    ],
  },
  {
    title: "API",
    icon: Code2,
    items: [
      ["options", "Options"],
      ["errors", "Errors"],
    ],
  },
  {
    title: "Format",
    icon: Cpu,
    items: [
      ["types", "Data model"],
      ["canonical", "Canonical encoding"],
      ["extensions", "Extension types"],
      ["tabular", "Tabular encoding"],
      ["envelopes", "Envelopes"],
      ["decoding", "Decoding rules"],
      ["messagepack", "MessagePack compatibility"],
      ["conformance", "Conformance"],
    ],
  },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4 border-t border-border/40 pt-10 first:border-0 first:pt-0">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="not-prose overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-border/50 align-top last:border-0">
              {row.map((cell, i) => (
                <td key={i} className="py-2 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const C = ({ children }: { children: ReactNode }) => <code className="whitespace-nowrap">{children}</code>;

const QUICK_START: { id: string; label: string; lang: string; code: string }[] = [
  {
    id: "js",
    label: "JavaScript",
    lang: "javascript",
    code: `import { encode, decode, encodeAsync } from "@btoon/js"; // or "btoon", the Node.js addon

const rows = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: \`user\${i}\`, active: i % 2 === 0 }));

const bytes = encode(rows);   // Uint8Array; the array is stored column by column
decode(bytes);                // deep-equals rows (keys come back in UTF-8 byte order)

// Compression: synchronous in Node.js; in browsers use encodeAsync (CompressionStream).
const packed = await encodeAsync(rows, { compress: true });
decode(packed);               // envelopes are detected automatically

const key = crypto.getRandomValues(new Uint8Array(32));
const signed = await encodeAsync(rows, { hmacKey: key });
decode(signed, { hmacKey: key });   // verified before anything is parsed`,
  },
  {
    id: "python",
    label: "Python",
    lang: "python",
    code: `import btoon

rows = [{"id": i, "name": f"user{i}", "active": i % 2 == 0} for i in range(1000)]

data = btoon.encode(rows)                    # bytes; the list is stored column by column
assert btoon.decode(data) == rows

packed = btoon.encode(rows, compress=True)   # zlib envelope, detected on decode
key = b"32 bytes of secret key material!"
signed = btoon.encode(rows, hmac_key=key)
btoon.decode(signed, hmac_key=key)`,
  },
  {
    id: "go",
    label: "Go",
    lang: "go",
    code: `import btoon "github.com/BTOON-project/btoon-go"

type User struct {
    ID     int    \`btoon:"id"\`
    Name   string \`btoon:"name"\`
    Active bool   \`btoon:"active"\`
}

users := []User{{1, "Ada", true}, {2, "Grace", false}, {3, "Edsger", true}}
key := []byte("...at least 32 random bytes...")

b, err := btoon.Marshal(users)   // tabular when that is smaller

var back []User
err = btoon.Unmarshal(b, &back)

v, err := btoon.Decode(b)        // dynamic values: map[string]any, []any, int64, ...

b, err = btoon.MarshalWithOptions(users, btoon.EncodeOptions{Compress: true, HMACKey: key})
v, err = btoon.DecodeWithOptions(b, btoon.DecodeOptions{HMACKey: key})`,
  },
  {
    id: "php",
    label: "PHP",
    lang: "php",
    code: `use function BTOON\\decode;
use function BTOON\\encode;

$bytes = encode(['name' => 'Alice', 'age' => 30, 'active' => true]);
bin2hex($bytes); // 83a6616374697665c3a36167651ea46e616d65a5416c696365
decode($bytes);  // ['active' => true, 'age' => 30, 'name' => 'Alice']

$rows = [['id' => 1, 'name' => 'Ada'], ['id' => 2, 'name' => 'Grace']];
$key = random_bytes(32);
$packed = encode($rows, ['compress' => true]);       // zlib envelope
$signed = encode($rows, ['hmac_key' => $key]);       // HMAC-SHA256
decode($signed, ['hmac_key' => $key]);`,
  },
  {
    id: "cpp",
    label: "C++",
    lang: "cpp",
    code: `#include <btoon/btoon.h>
using namespace btoon;

Array users;
for (int i = 0; i < 100; ++i) {
    users.push_back(Map{{"id", Int(i)}, {"name", String("user" + std::to_string(i))}});
}
Value doc = Map{{"users", users}, {"created", Timestamp::now()}};

std::vector<uint8_t> bytes = encode(doc);                       // tabular kicks in automatically
std::vector<uint8_t> packed = encode(doc, {.compress = true});  // zlib envelope
Value back = decode(packed);                                    // envelopes are detected
// Errors throw btoon::BtoonException; e.code() is the spec error code.`,
  },
];

const TABULAR_EXAMPLE = `[{"city": "Oslo", "temperature": 4},
 {"city": "Rome", "temperature": 18},
 {"city": "Lima", "temperature": 22}]

c7 3f f6                      ext 8, 63-byte payload, type -10 (tabular)
00000001                      version 1
00000002                      2 columns
00000003                      3 rows
00000004 63697479             "city"
0000000b 74656d7065726174757265   "temperature"
05 02                         type codes: string, integer
0000000f a44f736c6f a4526f6d65 a44c696d61   column 1: "Oslo" "Rome" "Lima"
00000003 04 12 16             column 2: 4 18 22

66 bytes, against 73 for the same array as plain MessagePack. With only two rows the
size rule keeps the plain array (49 bytes either way).`;

const TABULAR_LAYOUT = `ext 8/16/32 header with type -10 (0xf6), then the payload; every integer is u32 big-endian:

  version       = 1
  num_columns   = C            (C >= 1 when N >= 1)
  num_rows      = N
  C x { name_len, name }       column names, UTF-8, in canonical key order
  C x { type_code u8 }         informational, from the first row
  C x { col_len, N values }    each column's N cells as canonical BTOON values`;

const COMPRESSION_HEADER = `offset size field
0      4    magic              "BTON" = 42 54 4f 4e
4      1    version            = 1
5      1    algorithm          0 zlib, 1 LZ4, 2 Zstandard, 3 Brotli, 4 Snappy
6      2    reserved           = 0
8      4    compressed_size    u32 BE, length of the payload
12     4    uncompressed_size  u32 BE, length after decompression
16     ...  payload`;

const SIGNED_HEADER = `offset size field
0      4    magic        "BTSG" = 42 54 53 47
4      1    version      = 1
5      1    algorithm    = 1 (HMAC-SHA256)
6      2    reserved     = 0
8      32   mac          HMAC-SHA256(key, bytes[0..8) || payload)
40     ...  payload      a bare BTOON document or a compression envelope`;

export default function Docs() {
  return (
    <div className="container py-12">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-6" aria-label="Documentation">
            {NAV.map(({ title, icon: Icon, items }) => (
              <div key={title}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4" />
                  {title}
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {items.map(([id, label]) => (
                    <li key={id}>
                      <a href={`#${id}`} className="hover:text-foreground">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="prose prose-invert min-w-0 max-w-none space-y-10 prose-headings:scroll-mt-20 prose-code:before:content-none prose-code:after:content-none">
          <Section id="introduction" title="BTOON documentation">
            <p className="lead">
              BTOON ("Binary TOON") is a compact binary serialization format. It is{" "}
              <a href="https://github.com/msgpack/msgpack/blob/master/spec.md">MessagePack</a> with four additions:
            </p>
            <ol>
              <li>
                a <strong>columnar ("tabular") encoding</strong> for arrays of uniform objects, which writes each key once
                instead of once per row;
              </li>
              <li>
                <strong>extension types</strong> for timestamps, dates, datetimes, big integers and float32/float64
                vectors;
              </li>
              <li>an optional <strong>compression envelope</strong>;</li>
              <li>an optional <strong>HMAC-signed envelope</strong>.</li>
            </ol>
            <p>
              Encoding is <strong>canonical</strong>: one value has exactly one encoding, and every library writes the
              same bytes for it. Decoding is <strong>hardened</strong> for hostile input. For arrays of records, BTOON is
              typically 35–45% smaller than MessagePack before compression. Other data encodes exactly like canonical
              MessagePack.
            </p>
            <p>
              The name comes from <a href="https://github.com/toon-format/toon#readme">TOON</a>, a text format for LLM
              prompts that writes a table's field names once. BTOON brings that idea to a binary, MessagePack-compatible
              format. It isn't a binary encoding of TOON text, and as a binary format it is meant for storage and
              transport between programs.
            </p>
            <p>
              The authoritative definition is the <a href={SPEC}>specification (SPEC.md, version 0.1)</a> in btoon-core.
              This page summarizes it.
            </p>
          </Section>

          <Section id="installation" title="Installation">
            <p>
              Every library implements spec 0.1 (versions 0.1.x). The{" "}
              <Link href="/downloads">downloads page</Link> has install and build instructions for each.
            </p>
            <Table
              head={["Language", "Package", "Install", "Notes"]}
              rows={PACKAGES.map((p) => [
                p.language,
                <span key="n">
                  <C>{p.name}</C> ({p.registry})
                </span>,
                <C key="i">{p.install}</C>,
                p.summary,
              ])}
            />
          </Section>

          <Section id="playground" title="Playground">
            <p>
              Everything here runs in your browser with <C>@btoon/js</C>. Nothing is sent to a server. Pick an example or
              paste your own JSON to compare sizes with JSON and MessagePack, inspect the bytes, and decode them again.
            </p>
            <Suspense
              fallback={
                <Card className="not-prose flex h-64 items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </Card>
              }
            >
              <Playground />
            </Suspense>
          </Section>

          <Section id="quick-start" title="Quick start">
            <p>
              Every library has <C>encode</C> and <C>decode</C> with the same options and the same error codes. Option
              names follow each language's conventions.
            </p>
            <Tabs defaultValue="js" className="not-prose">
              <TabsList>
                {QUICK_START.map((q) => (
                  <TabsTrigger key={q.id} value={q.id}>
                    {q.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {QUICK_START.map((q) => (
                <TabsContent key={q.id} value={q.id} className="mt-3">
                  <CodeBlock lang={q.lang} code={q.code} />
                </TabsContent>
              ))}
            </Tabs>
          </Section>

          <Section id="options" title="Options">
            <p>The same options exist in every library. Defaults are the same everywhere.</p>
            <h3>Encoding</h3>
            <Table
              head={["Option", "JavaScript", "Python, PHP, C++", "Go", "Default"]}
              rows={[
                ["Wrap in a compression envelope", <C key="1">compress</C>, <C key="2">compress</C>, <C key="3">Compress</C>, "off"],
                ["Algorithm", <C key="1">compression</C>, <C key="2">compression</C>, <C key="3">Compression</C>, "zlib"],
                ["Tabular encoding", <C key="1">autoTabular</C>, <C key="2">auto_tabular</C>, <C key="3">DisableTabular</C>, "on"],
                ["Nesting limit", <C key="1">maxDepth</C>, <C key="2">max_depth</C>, <C key="3">MaxDepth</C>, "128"],
                ["Sign with HMAC-SHA256", <C key="1">hmacKey</C>, <C key="2">hmac_key</C>, <C key="3">HMACKey</C>, "none"],
              ]}
            />
            <h3>Decoding</h3>
            <Table
              head={["Option", "JavaScript", "Python, PHP, C++", "Go", "Default"]}
              rows={[
                ["Strict mode", <C key="1">strict</C>, <C key="2">strict</C>, <C key="3">NonStrict</C>, "on"],
                ["Nesting limit", <C key="1">maxDepth</C>, <C key="2">max_depth</C>, <C key="3">MaxDepth</C>, "128"],
                ["Largest decompressed size", <C key="1">maxDecompressedSize</C>, <C key="2">max_decompressed_size</C>, <C key="3">MaxDecompressedSize</C>, "256 MiB"],
                ["Accept compression envelopes", <C key="1">autoDecompress</C>, <C key="2">auto_decompress</C>, <C key="3">DisableDecompression</C>, "on"],
                ["Require and verify a signature", <C key="1">hmacKey</C>, <C key="2">hmac_key</C>, <C key="3">HMACKey</C>, "none"],
              ]}
            />
            <ul>
              <li>
                Go spells the options so that the zero value is the default, so three of them are inverted
                (<C>DisableTabular</C>, <C>NonStrict</C>, <C>DisableDecompression</C>). C++ names the algorithm{" "}
                <C>compression_algorithm</C>.
              </li>
              <li>
                Compression is skipped for documents under 256 bytes and whenever it would save less than 5%. The output
                is then the plain document, which every decoder reads as well.
              </li>
              <li>
                An empty HMAC key is an error (<C>invalid_argument</C>), never "no key". Use at least 32 random bytes.
              </li>
              <li>
                Each library has a few language-specific options, for example how timestamps decode. See its README.
              </li>
            </ul>
          </Section>

          <Section id="errors" title="Errors">
            <p>
              Failures carry a machine-readable code that is the same in every library: <C>err.code</C> in JavaScript and
              Python, <C>e.code()</C> in C++, <C>$e-&gt;errorCode</C> in PHP, and the <C>Code</C> field of{" "}
              <C>*btoon.Error</C> in Go.
            </p>
            <Table
              head={["Code", "Meaning"]}
              rows={[
                [<C key="c">truncated</C>, "The input ends before a value is complete, or a length runs past the input."],
                [<C key="c">invalid_marker</C>, "The reserved byte 0xc1."],
                [<C key="c">trailing_data</C>, "Bytes remain after the top-level value."],
                [<C key="c">invalid_utf8</C>, "A string, map key or column name isn't well-formed UTF-8."],
                [<C key="c">non_string_key</C>, "A map key isn't a string."],
                [<C key="c">duplicate_key</C>, "A map has the same key twice."],
                [<C key="c">max_depth</C>, "Nesting deeper than the limit (also cyclic values when encoding)."],
                [<C key="c">invalid_extension</C>, "A malformed timestamp, date, datetime, bigint or vector payload."],
                [<C key="c">invalid_tabular</C>, "A malformed tabular payload."],
                [<C key="c">invalid_envelope</C>, "A malformed compression or signed envelope, or a payload that decompresses to the wrong size."],
                [<C key="c">size_limit</C>, "A declared size above the configured limit."],
                [<C key="c">unsupported_compression</C>, "An unknown algorithm, or one this build doesn't include."],
                [<C key="c">authentication_failed</C>, "A missing or wrong signature, or a signed input decoded without a key."],
                [<C key="c">invalid_argument</C>, "A value that can't be encoded, or an invalid option (API-level)."],
              ]}
            />
          </Section>

          <Section id="types" title="Data model">
            <Table
              head={["Type", "Encoding"]}
              rows={[
                ["nil, boolean", "MessagePack nil, false, true"],
                ["integer", "Any size. [-2^63, 2^64-1] uses MessagePack integers; anything else is a bigint extension."],
                ["float", "IEEE 754 binary64. NaN, ±Infinity and -0.0 are preserved."],
                ["string", "Well-formed UTF-8."],
                ["binary", "MessagePack bin."],
                ["array", "MessagePack array, or the tabular encoding for arrays of uniform maps."],
                ["map", "String keys only, each key at most once. This is the one restriction relative to MessagePack."],
                ["timestamp, date, datetime", "Extension types -1, -2 and -3."],
                ["float32 / float64 vector", "Extension types -5 and -6, little-endian."],
                ["extension", "Any other (type, bytes) pair, passed through untouched."],
              ]}
            />
            <p>
              The tabular encoding is not a separate type: it is another way to write an array of maps, and it decodes to
              exactly that.
            </p>
          </Section>

          <Section id="canonical" title="Canonical encoding">
            <p>Encoders must produce exactly one encoding for each value:</p>
            <ol>
              <li>
                <strong>Integers</strong> use the smallest format that holds the value, whatever the source type's
                signedness: a signed and an unsigned 5 both encode as <C>05</C>.
              </li>
              <li>
                <strong>Floats</strong> are always float64 (<C>cb</C>). NaN is written as <C>7ff8000000000000</C>; other
                values, including -0.0, bit for bit.
              </li>
              <li>
                <strong>Strings, binaries, arrays, maps and extensions</strong> use the smallest header that fits. Payloads
                of exactly 1, 2, 4, 8 or 16 bytes use fixext.
              </li>
              <li>
                <strong>Map keys</strong> are sorted by their UTF-8 bytes (unsigned bytewise; a prefix sorts first).
              </li>
              <li>
                <strong>Arrays of maps</strong> use the tabular encoding exactly when the size rule says so, unless the
                caller turned it off.
              </li>
              <li>
                <strong>Timestamps</strong> use the smallest MessagePack timestamp form that fits.
              </li>
              <li>No bytes follow the value.</li>
            </ol>
            <CodeBlock
              code={`{"name": "Alice", "age": 30, "active": true}

83                 map with 3 entries, keys in UTF-8 byte order
a6 616374697665    "active"
c3                 true
a3 616765          "age"
1e                 30
a4 6e616d65        "name"
a5 416c696365      "Alice"`}
            />
          </Section>

          <Section id="extensions" title="Extension types">
            <Table
              head={["Id", "Type", "Payload"]}
              rows={[
                ["-1", "timestamp", "The MessagePack timestamp (4, 8 or 12 bytes), or a BTOON 14-byte form with an i16 UTC offset in minutes. Seconds and nanoseconds are always UTC."],
                ["-2", "date", "i64 big-endian, milliseconds since the Unix epoch."],
                ["-3", "datetime", "i64 big-endian, nanoseconds since the Unix epoch."],
                ["-4", "bigint", "Two's-complement big-endian, minimal length. Only for integers outside [-2^63, 2^64-1]."],
                ["-5", "float32 vector", "Packed binary32, little-endian."],
                ["-6", "float64 vector", "Packed binary64, little-endian."],
                ["-10", "tabular", "See below."],
              ]}
            />
            <p>
              Vectors are little-endian on purpose, the one exception to MessagePack's big-endian rule: embeddings then
              map straight onto <C>Float32Array</C>, numpy arrays and native memory. Ids -9 to -7 and -128 to -11 are
              reserved for future versions; decoders return them as generic extensions. Ids 0 to 127 belong to
              applications.
            </p>
          </Section>

          <Section id="tabular" title="Tabular encoding">
            <p>
              An array of N maps that all have the same C keys can be written column by column: the keys once, then each
              column's N values.
            </p>
            <CodeBlock code={TABULAR_LAYOUT} />
            <p>
              Cells can be any value, including nested arrays, maps and tables. The type code describes the first row's
              value: 0 nil, 1 boolean, 2 integer in int64 range, 3 integer above it, 4 float, 5 string, 6 binary, 7 array,
              8 map, 9 anything else. Decoders don't rely on it.
            </p>
            <h3>When encoders use it</h3>
            <p>
              An array qualifies when it has at least two elements, all of them maps with the same non-empty set of keys.
              A qualifying array is written as a table if and only if this holds:
            </p>
            <CodeBlock code="N × (maphdr(C) + Σ (strhdr(len k) + len k))  >  18 + Σ (9 + len k)" />
            <p>
              The left side is what plain MessagePack spends repeating the keys, the right side the table's overhead.
              <C>len k</C> is a key's UTF-8 length, <C>maphdr</C> and <C>strhdr</C> are MessagePack header sizes. Records
              with a few short keys switch at around 3 to 8 rows. Because the rule is fixed, every library makes the same
              choice and the output stays canonical.
            </p>
            <h3>Example</h3>
            <CodeBlock code={TABULAR_EXAMPLE} />
            <p>
              Decoders reject a table whose version isn't 1, whose fields run past the payload, whose column names
              repeat (in non-strict mode too), whose columns don't hold exactly N values in <C>col_len</C> bytes, or that
              has bytes left over.
            </p>
          </Section>

          <Section id="envelopes" title="Envelopes">
            <h3>Compression</h3>
            <CodeBlock code={COMPRESSION_HEADER} />
            <ul>
              <li>zlib (RFC 1950) is required in every library. LZ4 (block format), Zstandard, Brotli and Snappy (raw) are optional.</li>
              <li>Requesting compression without an algorithm means zlib. An algorithm the encoder lacks is an error.</li>
              <li>
                Decoders check the header in order (version, reserved bytes, <C>compressed_size</C>, then{" "}
                <C>uncompressed_size</C> against their limit, 256 MiB by default, then the algorithm) before decompressing,
                and stop at the declared size. Decompression bombs fail with <C>size_limit</C> or <C>invalid_envelope</C>.
              </li>
              <li>Compressed bytes aren't canonical: different zlib builds produce different, equally valid streams.</li>
            </ul>
            <h3>Signature</h3>
            <CodeBlock code={SIGNED_HEADER} />
            <ul>
              <li>Layering is always sign(compress(encode(value))).</li>
              <li>
                A decoder with a key requires the envelope and verifies the MAC in constant time before it parses anything.
              </li>
              <li>
                A decoder without a key rejects signed input (<C>authentication_failed</C>) instead of ignoring the
                signature.
              </li>
            </ul>
          </Section>

          <Section id="decoding" title="Decoding rules">
            <p>
              Decoders accept every valid MessagePack encoding of a value, canonical or not, and produce the same logical
              value. Strict mode is the default and rejects invalid UTF-8, duplicate keys and trailing bytes. Non-strict
              mode may allow those three, and never anything else.
            </p>
            <ul>
              <li>Every read is bounds-checked.</li>
              <li>
                Nesting is limited to 128 levels by default. The top-level value is depth 0, and a table counts two levels.
              </li>
              <li>
                Nothing is allocated before the remaining input could justify it: an array of N elements needs at least N
                more bytes, a table N × C.
              </li>
              <li>Errors are reported front to back, the first one found.</li>
            </ul>
          </Section>

          <Section id="messagepack" title="MessagePack compatibility">
            <p>
              Every BTOON document is valid MessagePack, so generic tools can always read it. BTOON's own types are negative
              extension ids, which a plain MessagePack decoder returns as opaque extension values. Turn the tabular encoding
              off (<C>autoTabular: false</C>) when the receiver is a plain MessagePack decoder; the output is then canonical
              MessagePack. The 14-byte timestamp form with a UTC offset is the one encoding generic decoders reject, and
              encoders only write it when you supply an offset.
            </p>
            <p>
              In the other direction, a MessagePack document is valid BTOON when its map keys are unique strings, its
              strings are valid UTF-8, and it doesn't use BTOON's extension ids for something else.
            </p>
          </Section>

          <Section id="conformance" title="Conformance">
            <p>
              btoon-core ships conformance vectors in{" "}
              <a href="https://github.com/BTOON-project/btoon-core/tree/main/tests/vectors">tests/vectors/btoon-vectors.json</a>,
              generated by an independent Python oracle. Every library must decode every valid vector to its value,
              re-encode the canonical ones byte for byte, and reject the invalid ones. All six libraries (C++, Python,
              Node.js, JavaScript, Go and PHP) run them in their test suites.
            </p>
            <ul>
              <li>
                <a href={SPEC}>SPEC.md</a>: the full specification.
              </li>
              <li>
                <a href="https://github.com/BTOON-project/btoon-core/blob/main/docs/IMPLEMENTATION-GUIDE.md">IMPLEMENTATION-GUIDE.md</a>:
                notes for writing a new implementation.
              </li>
              <li>
                <a href="https://msgpack.org">msgpack.org</a>: MessagePack itself.
              </li>
            </ul>
          </Section>
        </article>
      </div>
    </div>
  );
}
