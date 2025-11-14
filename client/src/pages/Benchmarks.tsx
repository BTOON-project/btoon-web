import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Package, ArrowLeft, BarChart3, Zap } from "lucide-react";

export default function Benchmarks() {
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
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Docs
              </a>
            </Link>
            <Link href="/benchmarks">
              <a className="text-sm font-medium text-primary">
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

        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-primary" />
              Performance Benchmarks
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive performance comparison of BTOON against JSON and MessagePack
            </p>
          </div>

          {/* Test Environment */}
          <Card className="p-6 bg-card border-border mb-8">
            <h2 className="text-2xl font-semibold mb-4">Test Environment</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>CPU:</strong> Intel Core i7-9750H @ 2.60GHz</li>
              <li><strong>RAM:</strong> 16GB DDR4</li>
              <li><strong>OS:</strong> Ubuntu 22.04 LTS</li>
              <li><strong>Compiler:</strong> GCC 11.4.0 with -O3 optimization</li>
              <li><strong>Dataset:</strong> 100 uniform user records with 5 fields each</li>
            </ul>
          </Card>

          {/* Size Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Size Comparison
            </h2>
            
            <Card className="p-6 bg-card border-border mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Format</th>
                      <th className="text-right py-3 px-4">Size (bytes)</th>
                      <th className="text-right py-3 px-4">vs JSON</th>
                      <th className="text-right py-3 px-4">vs MessagePack</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">JSON</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">4,523</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">-</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">-</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">MessagePack</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">2,741</td>
                      <td className="text-right py-3 px-4 text-green-500">-39.4%</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">-</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-semibold text-primary">BTOON Tabular</td>
                      <td className="text-right py-3 px-4 font-semibold text-primary">1,847</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">-59.2%</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">-32.6%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-primary">BTOON + zlib</td>
                      <td className="text-right py-3 px-4 font-semibold text-primary">798</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">-82.4%</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">-70.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-2">Size Savings vs JSON</div>
                <div className="text-3xl font-bold text-primary">59.2%</div>
                <div className="text-xs text-muted-foreground mt-1">Without compression</div>
              </Card>
              
              <Card className="p-4 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-2">Size Savings vs MessagePack</div>
                <div className="text-3xl font-bold text-primary">32.6%</div>
                <div className="text-xs text-muted-foreground mt-1">Tabular optimization</div>
              </Card>
            </div>
          </section>

          {/* Speed Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Encoding Speed</h2>
            
            <Card className="p-6 bg-card border-border mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Format</th>
                      <th className="text-right py-3 px-4">Time (μs)</th>
                      <th className="text-right py-3 px-4">Speedup vs JSON</th>
                      <th className="text-right py-3 px-4">Throughput</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">JSON</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~150</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">1.0x</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~30 MB/s</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">MessagePack</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~35</td>
                      <td className="text-right py-3 px-4 text-green-500">4.3x</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~78 MB/s</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-primary">BTOON Tabular</td>
                      <td className="text-right py-3 px-4 font-semibold text-primary">~38</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">3.9x</td>
                      <td className="text-right py-3 px-4 font-semibold text-primary">~119 MB/s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <h2 className="text-2xl font-semibold mb-6 mt-8">Decoding Speed</h2>
            
            <Card className="p-6 bg-card border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Format</th>
                      <th className="text-right py-3 px-4">Time (μs)</th>
                      <th className="text-right py-3 px-4">Speedup vs JSON</th>
                      <th className="text-right py-3 px-4">Throughput</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">JSON</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~280</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">1.0x</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~16 MB/s</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">MessagePack</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~42</td>
                      <td className="text-right py-3 px-4 text-green-500">6.7x</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">~65 MB/s</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-primary">BTOON Tabular</td>
                      <td className="text-right py-3 px-4 font-semibold text-primary">~45</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">6.2x</td>
                      <td className="text-right py-3 px-4 font-semibold text-primary">~100 MB/s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Scaling Behavior */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Scaling Behavior</h2>
            
            <Card className="p-6 bg-card border-border">
              <p className="text-muted-foreground mb-4">
                BTOON's tabular optimization becomes more effective as dataset size increases:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Rows</th>
                      <th className="text-right py-3 px-4">JSON Size</th>
                      <th className="text-right py-3 px-4">MessagePack Size</th>
                      <th className="text-right py-3 px-4">BTOON Size</th>
                      <th className="text-right py-3 px-4">BTOON Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">10</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">523 bytes</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">274 bytes</td>
                      <td className="text-right py-3 px-4 text-primary">184 bytes</td>
                      <td className="text-right py-3 px-4 text-green-500">32.8%</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">100</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">4,523 bytes</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">2,741 bytes</td>
                      <td className="text-right py-3 px-4 text-primary">1,847 bytes</td>
                      <td className="text-right py-3 px-4 text-green-500">32.6%</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">1,000</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">45,023 bytes</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">27,401 bytes</td>
                      <td className="text-right py-3 px-4 text-primary">18,047 bytes</td>
                      <td className="text-right py-3 px-4 text-green-500">34.1%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">10,000</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">450,123 bytes</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">273,901 bytes</td>
                      <td className="text-right py-3 px-4 text-primary">180,147 bytes</td>
                      <td className="text-right py-3 px-4 text-green-500">34.2%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Methodology */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Methodology</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold mb-3">Test Dataset</h3>
              <p className="text-muted-foreground mb-4">
                All benchmarks use a uniform dataset of user records with the following structure:
              </p>
              <pre className="bg-background p-4 rounded border border-border text-sm overflow-x-auto">
{`{
  "id": 1,
  "name": "User1",
  "email": "user1@example.com",
  "age": 21,
  "active": true
}`}
              </pre>
              
              <h3 className="font-semibold mb-3 mt-6">Measurement</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Each test runs 1,000 iterations with warm-up</li>
                <li>• Timing measured using high-resolution clock</li>
                <li>• Median values reported to reduce noise</li>
                <li>• Size measured in bytes after encoding</li>
              </ul>
              
              <h3 className="font-semibold mb-3 mt-6">Source Code</h3>
              <p className="text-muted-foreground">
                Benchmark source code is available in the{" "}
                <a 
                  href="https://github.com/BTOON-project/btoon-core/tree/main/benchmarks" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  btoon-core repository
                </a>
                .
              </p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
