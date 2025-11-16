import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Code, Zap, Database, Package, Download, Github } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BTOON</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/docs">
              <a className="text-sm font-medium hover:text-primary transition-colors">
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
            <a 
              href="https://github.com/BTOON-project" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full">
              TOON Format + Binary
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Binary TOON Serialization,
              <br />
              Optimized for Uniform Tables
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              BTOON is built for the TOON format—bringing MessagePack-style binary encoding, optional compression, and a custom tabular extension that delivers{" "}
              <strong>20-40% smaller</strong> payloads than MessagePack and dramatically less overhead than JSON.
            </p>
            <div className="flex gap-4">
              <Link href="/docs">
                <Button size="lg" className="gap-2">
                  <Code className="h-5 w-5" />
                  Get Started
                </Button>
              </Link>
              <Link href="/downloads">
                <Button size="lg" variant="outline" className="gap-2">
                  <Download className="h-5 w-5" />
                  Download
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm font-mono">
              <div className="text-muted-foreground mb-4"># Python Example</div>
              <Streamdown>
{`\`\`\`python
import btoon

# Tabular data (100 users)
users = [
    {"id": i, "name": f"User{i}", 
     "email": f"user{i}@example.com"}
    for i in range(100)
]

# Automatic optimization
encoded = btoon.encode(users)

# 46% smaller than MessagePack
# 59% smaller than JSON
\`\`\`
`}
              </Streamdown>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why BTOON?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <Zap className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">High Performance</h3>
            <p className="text-muted-foreground">
              4-7x faster than JSON with near-native C++ performance. Encode/decode 100 rows in under 50 microseconds.
            </p>
          </Card>
          
          <Card className="p-6 bg-card border-border">
            <Database className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tabular Optimization</h3>
            <p className="text-muted-foreground">
              Custom extension type -1 encodes schema once, then packs rows as primitives. Perfect for LLM data exchange.
            </p>
          </Card>
          
          <Card className="p-6 bg-card border-border">
            <Package className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">TOON + MessagePack Compatible</h3>
            <p className="text-muted-foreground">
              Extends the TOON format with a MessagePack-compatible binary layer so you can reuse existing tooling while gaining TOON&apos;s schema-aware tables.
            </p>
          </Card>
        </div>
      </section>

      {/* Language Support */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Multi-Language Support</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { name: "Python", pkg: "pip install btoon" },
            { name: "Node.js", pkg: "npm install btoon" },
            { name: "JavaScript", pkg: "npm install @btoon/javascript" },
            { name: "Go", pkg: "go get github.com/BTOON-project/btoon-go" },
            { name: "PHP", pkg: "composer require btoon/btoon" },
            { name: "C++", pkg: "Core library" }
          ].map((lang) => (
            <Card key={lang.name} className="p-4 bg-card border-border">
              <div className="font-semibold mb-1">{lang.name}</div>
              <code className="text-xs text-muted-foreground">{lang.pkg}</code>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Performance Comparison</h2>
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 bg-card border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Format</th>
                    <th className="text-right py-3 px-4">Size</th>
                    <th className="text-right py-3 px-4">Encode</th>
                    <th className="text-right py-3 px-4">Decode</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">JSON</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">4,523 bytes</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">~150 μs</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">~280 μs</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">MessagePack</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">2,741 bytes</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">~35 μs</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">~42 μs</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-primary">BTOON Tabular</td>
                    <td className="text-right py-3 px-4 font-semibold text-primary">1,847 bytes</td>
                    <td className="text-right py-3 px-4 font-semibold text-primary">~38 μs</td>
                    <td className="text-right py-3 px-4 font-semibold text-primary">~45 μs</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Benchmark: 100 uniform user records on Intel i7
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-bold">BTOON</span>
              </div>
              <p className="text-sm text-muted-foreground">
                High-performance binary serialization format for the TOON spec with built-in tabular optimization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs"><a className="hover:text-foreground transition-colors">Documentation</a></Link></li>
                <li><Link href="/benchmarks"><a className="hover:text-foreground transition-colors">Benchmarks</a></Link></li>
                <li><Link href="/downloads"><a className="hover:text-foreground transition-colors">Downloads</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/BTOON-project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li><a href="https://btoon.net" className="hover:text-foreground transition-colors">Website</a></li>
                <li>
                  <a
                    href="https://github.com/toon-format/toon#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    TOON Format
                  </a>
                </li>
                <li>
                  <a
                    href="https://tonl.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    TONL
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 BTOON Contributors. Released under MIT License.
          </div>
        </div>
      </footer>
    </div>
  );
}
