import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Package, ArrowLeft, Book, Code2, Cpu } from "lucide-react";
import { Streamdown } from "streamdown";
import Playground from "@/components/Playground";
import { useEffect } from "react";

export default function Docs() {
  // Handle hash navigation for anchor links
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">BTOON</span>
            </a>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/docs">
              <a className="text-sm font-medium text-primary">
                Docs
              </a>
            </Link>
            <Link href="/benchmarks">
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Benchmarks
              </a>
            </Link>
            <Link href="/downloads">
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Downloads
              </a>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Book className="h-4 w-4" />
                Getting Started
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#introduction" className="hover:text-foreground transition-colors">Introduction</a></li>
                <li><a href="#installation" className="hover:text-foreground transition-colors">Installation</a></li>
                <li><a href="#playground" className="hover:text-foreground transition-colors">Live Playground</a></li>
                <li><a href="#quick-start" className="hover:text-foreground transition-colors">Quick Start</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                API Reference
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#encode" className="hover:text-foreground transition-colors">encode()</a></li>
                <li><a href="#decode" className="hover:text-foreground transition-colors">decode()</a></li>
                <li><a href="#options" className="hover:text-foreground transition-colors">Options</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Technical Details
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#tabular-format" className="hover:text-foreground transition-colors">Tabular Format</a></li>
                <li><a href="#messagepack-compat" className="hover:text-foreground transition-colors">MessagePack Compatibility</a></li>
                <li><a href="#type-system" className="hover:text-foreground transition-colors">Type System</a></li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="prose prose-invert max-w-none space-y-16">
            <section id="introduction" className="space-y-6">
              <h1>BTOON Documentation</h1>
              <p className="lead">
                BTOON (Binary TOON) is the binary companion to the Token-Oriented Object Notation (TOON) format&mdash;bringing MessagePack-grade speed, optional compression, and schema-aware tables to TOON payloads.
              </p>
              <div className="grid md:grid-cols-2 gap-4 not-prose mt-6">
                <Card className="p-5 bg-card/60 border border-border/60">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Purpose</h4>
                  <p className="text-sm text-muted-foreground">
                    Build prompts and datasets in TOON, then stream them in binary with BTOON for lower token counts and faster transport. Think MessagePack, but purpose-built for TOON&apos;s tabular layout.
                  </p>
                </Card>
                <Card className="p-5 bg-card/60 border border-border/60">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Compatibility</h4>
                  <p className="text-sm text-muted-foreground">
                    100% compatible with both TOON semantics and the MessagePack specification&mdash;existing MessagePack decoders can read BTOON frames, and TOON parsers can reconstruct the original structure.
                  </p>
                </Card>
              </div>
              
              <h2>Key Features</h2>
              <ul>
                <li><strong>TOON-Native</strong>: Preserves TOON schema headers and column semantics in binary form</li>
                <li><strong>MessagePack Compatible</strong>: Fully compliant with the MessagePack specification</li>
                <li><strong>Tabular Optimization</strong>: 20-40% size reduction for uniform datasets with table-aware encoding</li>
                <li><strong>High Performance</strong>: 4-7x faster than JSON encoding/decoding</li>
                <li><strong>Multi-Language</strong>: Bindings for Python, Node.js, JavaScript, Go, PHP, and C++</li>
                <li><strong>Optional Compression</strong>: Built-in zlib support for additional 10-30% savings</li>
              </ul>
            </section>

            <section id="toon-format">
              <h2>About the TOON Format</h2>
              <p>
                TOON (Token-Oriented Object Notation) is a compact, schema-aware text format designed for LLM prompts. BTOON extends TOON with a binary transport that is especially effective for table-shaped data.
              </p>
              <div className="not-prose grid md:grid-cols-2 gap-4 mt-6">
                <Card className="p-5 bg-card border-border">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Read the Spec</h4>
                  <a
                    href="https://github.com/toon-format/toon#readme"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-base font-medium"
                  >
                    github.com/toon-format/toon
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Official specification, SDKs, and benchmarks for TOON. BTOON follows spec v2.0.
                  </p>
                </Card>
                <Card className="p-5 bg-card border-border">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Visit toonformat.dev</h4>
                  <a
                    href="https://toonformat.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-base font-medium"
                  >
                    toonformat.dev
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Guides for modeling prompts, comparison tables, and rationale for TOON&apos;s structure.
                  </p>
                </Card>
              </div>
            </section>

            <section id="installation" className="mt-12 border-t border-border/40 pt-12 space-y-6">
              <h2>Installation</h2>
              
              <h3>Python</h3>
              <Card className="p-4 bg-card border-border not-prose">
                <Streamdown>
{`\`\`\`bash
# Install btoon-core first
git clone https://github.com/BTOON-project/btoon-core.git
cd btoon-core && mkdir build && cd build
cmake .. && make && sudo make install

# Install Python bindings
pip install btoon
\`\`\`
`}
                </Streamdown>
              </Card>

              <h3 className="mt-6">Node.js</h3>
              <Card className="p-4 bg-card border-border not-prose">
                <Streamdown>
{`\`\`\`bash
# Install btoon-core first (see above)

# Install Node.js bindings
npm install btoon
\`\`\`
`}
                </Streamdown>
              </Card>

              <h3 className="mt-6">JavaScript (Browser)</h3>
              <Card className="p-4 bg-card border-border not-prose">
                <Streamdown>
{`\`\`\`bash
npm install @btoon/javascript
\`\`\`
`}
                </Streamdown>
              </Card>
            </section>

            <section id="playground" className="mt-12 border-t border-border/40 pt-12 space-y-6">
              <h2>Live Playground</h2>
              <p>
                Try encoding and decoding data with BTOON right in your browser. See how it compares to JSON in terms of size and performance.
              </p>
              <Playground />
            </section>

            <section id="quick-start" className="mt-12 border-t border-border/40 pt-12 space-y-6">
              <h2>Quick Start</h2>
              
              <h3>Python Example</h3>
              <Card className="p-4 bg-card border-border not-prose">
                <Streamdown>
{`\`\`\`python
import btoon

# Encode data
data = {
    "name": "Alice",
    "age": 30,
    "scores": [95, 87, 92]
}

encoded = btoon.encode(data)

# Decode
decoded = btoon.decode(encoded)
print(decoded)

# Tabular data optimization
users = [
    {"id": i, "name": f"User{i}"}
    for i in range(100)
]

# Automatic tabular optimization
encoded = btoon.encode(users, auto_tabular=True)
# 20-40% smaller than standard MessagePack!
\`\`\`
`}
                </Streamdown>
              </Card>

              <h3 className="mt-6">Node.js Example</h3>
              <Card className="p-4 bg-card border-border not-prose">
                <Streamdown>
{`\`\`\`javascript
const btoon = require('btoon');

// Encode data
const data = {
  name: "Alice",
  age: 30,
  scores: [95, 87, 92]
};

const encoded = btoon.encode(data);

// Decode
const decoded = btoon.decode(encoded);
console.log(decoded);

// Tabular optimization
const users = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: \`User\${i}\`
}));

const encoded = btoon.encode(users, { autoTabular: true });
\`\`\`
`}
                </Streamdown>
              </Card>
            </section>

            <section id="encode" className="mt-12 border-t border-border/40 pt-12 space-y-6">
              <h2>API Reference</h2>
              
              <h3>encode(value, options?)</h3>
              <p>Encode a value to BTOON binary format.</p>
              
              <h4>Parameters</h4>
              <ul>
                <li><code>value</code> (any): The value to encode</li>
                <li><code>options</code> (object, optional):
                  <ul>
                    <li><code>compress</code> (boolean): Enable zlib compression (default: false)</li>
                    <li><code>auto_tabular</code> / <code>autoTabular</code> (boolean): Automatically detect and optimize tabular data (default: true)</li>
                  </ul>
                </li>
              </ul>
              
              <h4>Returns</h4>
              <p>Binary encoded data (bytes in Python, Buffer in Node.js, Uint8Array in JavaScript)</p>
            </section>

            <section id="decode" className="mt-8 border-t border-border/40 pt-12 space-y-6">
              <h3>decode(data, options?)</h3>
              <p>Decode BTOON binary data to a value.</p>
              
              <h4>Parameters</h4>
              <ul>
                <li><code>data</code> (bytes/Buffer/Uint8Array): Binary data to decode</li>
                <li><code>options</code> (object, optional):
                  <ul>
                    <li><code>decompress</code> (boolean): Enable zlib decompression (default: false)</li>
                  </ul>
                </li>
              </ul>
              
              <h4>Returns</h4>
              <p>Decoded value</p>
            </section>

            <section id="tabular-format" className="mt-12 border-t border-border/40 pt-12 space-y-6">
              <h2>Tabular Format Specification</h2>
              <p>
                BTOON uses MessagePack extension type <code>-1</code> for tabular data. The format encodes the schema (column names) once in the header, then packs row values without type tags.
              </p>
              
              <h3>Format Structure</h3>
              <Card className="p-4 bg-card border-border not-prose">
                <Streamdown>
{`\`\`\`
[ext header] [type=-1] [schema] [rows]

Schema:
  - num_columns (uint32)
  - column_names (repeated: length + utf8 string)
  
Rows:
  - num_rows (uint32)
  - values (row-major, primitives only)
\`\`\`
`}
                </Streamdown>
              </Card>
              
              <h3>Requirements</h3>
              <ul>
                <li>All rows must have the same keys</li>
                <li>Values must be primitives (no nested objects/arrays)</li>
                <li>Minimum 2 rows to trigger optimization</li>
              </ul>
            </section>

            <section id="messagepack-compat" className="mt-12 border-t border-border/40 pt-12 space-y-6">
              <h2>MessagePack Compatibility</h2>
              <p>
                BTOON is fully compatible with the MessagePack specification. Standard MessagePack decoders will decode BTOON data correctly, though they will treat the tabular extension as a generic extension type. When paired with TOON-aware tooling, the tabular schema is restored automatically.
              </p>
              
              <h3>Type Mapping</h3>
              <div className="overflow-x-auto not-prose">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">BTOON Type</th>
                      <th className="text-left py-2">MessagePack Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2">null</td>
                      <td className="py-2">nil (0xc0)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">boolean</td>
                      <td className="py-2">true/false (0xc2/0xc3)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">int64/uint64</td>
                      <td className="py-2">fixint/int8/int16/int32/int64</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">float64</td>
                      <td className="py-2">float64 (0xcb)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">string</td>
                      <td className="py-2">fixstr/str8/str16/str32</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">binary</td>
                      <td className="py-2">bin8/bin16/bin32</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">array</td>
                      <td className="py-2">fixarray/array16/array32</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">map</td>
                      <td className="py-2">fixmap/map16/map32</td>
                    </tr>
                    <tr>
                      <td className="py-2">tabular</td>
                      <td className="py-2">ext type -1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="related-resources" className="mt-12">
              <h2>Related Resources</h2>
              <ul>
                <li>
                  <a href="https://github.com/toon-format/toon#readme" target="_blank" rel="noreferrer">
                    TOON specification and TypeScript SDK
                  </a>
                </li>
                <li>
                  <a href="https://toonformat.dev" target="_blank" rel="noreferrer">
                    Official TOON format site (guides, rationale, and examples)
                  </a>
                </li>
                <li>
                  <a href="https://msgpack.org" target="_blank" rel="noreferrer">
                    MessagePack specification
                  </a>
                </li>
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
