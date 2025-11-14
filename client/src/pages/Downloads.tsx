import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Package, ArrowLeft, Download, Github, Terminal, Code2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Downloads() {
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
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Benchmarks
              </a>
            </Link>
            <Link href="/downloads">
              <a className="text-sm font-medium text-primary">
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
              <Download className="h-10 w-10 text-primary" />
              Downloads & Installation
            </h1>
            <p className="text-xl text-muted-foreground">
              Get started with BTOON in your preferred language
            </p>
          </div>

          {/* Core Library */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              Core Library (C++)
            </h2>
            
            <Card className="p-6 bg-card border-border mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">btoon-core</h3>
                  <p className="text-sm text-muted-foreground">
                    C++20 library with MessagePack compatibility and tabular optimization
                  </p>
                </div>
                <a 
                  href="https://github.com/BTOON-project/btoon-core" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
              
              <div className="not-prose">
                <Streamdown>
{`\`\`\`bash
# Clone repository
git clone https://github.com/BTOON-project/btoon-core.git
cd btoon-core

# Build and install
mkdir build && cd build
cmake ..
make -j4
sudo make install
\`\`\`
`}
                </Streamdown>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <strong>Requirements:</strong> CMake 3.15+, C++20 compiler, zlib
              </div>
            </Card>
          </section>

          {/* Language Bindings */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Language Bindings
            </h2>

            {/* Python */}
            <Card className="p-6 bg-card border-border mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Python</h3>
                  <p className="text-sm text-muted-foreground">
                    pybind11-based bindings for Python 3.7+
                  </p>
                </div>
                <a 
                  href="https://github.com/BTOON-project/btoon-python" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
              
              <div className="not-prose">
                <Streamdown>
{`\`\`\`bash
# Install from PyPI (requires btoon-core)
pip install btoon

# Or from source
git clone https://github.com/BTOON-project/btoon-python.git
cd btoon-python
pip install .
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>

            {/* Node.js */}
            <Card className="p-6 bg-card border-border mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Node.js</h3>
                  <p className="text-sm text-muted-foreground">
                    N-API native addon for Node.js 14+
                  </p>
                </div>
                <a 
                  href="https://github.com/BTOON-project/btoon-nodejs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
              
              <div className="not-prose">
                <Streamdown>
{`\`\`\`bash
# Install from npm (requires btoon-core)
npm install btoon

# Or from source
git clone https://github.com/BTOON-project/btoon-nodejs.git
cd btoon-nodejs
npm install
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>

            {/* JavaScript */}
            <Card className="p-6 bg-card border-border mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">JavaScript (Browser)</h3>
                  <p className="text-sm text-muted-foreground">
                    Pure JavaScript + WebAssembly, no native dependencies
                  </p>
                </div>
                <a 
                  href="https://github.com/BTOON-project/btoon-javascript" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
              
              <div className="not-prose">
                <Streamdown>
{`\`\`\`bash
# Install from npm
npm install @btoon/javascript

# Or use via CDN
<script src="https://unpkg.com/@btoon/javascript"></script>
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>

            {/* Go */}
            <Card className="p-6 bg-card border-border mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Go</h3>
                  <p className="text-sm text-muted-foreground">
                    cgo bindings for Go 1.18+
                  </p>
                </div>
                <a 
                  href="https://github.com/BTOON-project/btoon-go" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
              
              <div className="not-prose">
                <Streamdown>
{`\`\`\`bash
# Install (requires btoon-core)
go get github.com/BTOON-project/btoon-go
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>

            {/* PHP */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">PHP</h3>
                  <p className="text-sm text-muted-foreground">
                    PHP extension for PHP 7.4+
                  </p>
                </div>
                <a 
                  href="https://github.com/BTOON-project/btoon-php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
              
              <div className="not-prose">
                <Streamdown>
{`\`\`\`bash
# Install via Composer (requires btoon-core)
composer require btoon/btoon
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>
          </section>

          {/* Quick Start Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Quick Start Examples</h2>

            <Card className="p-6 bg-card border-border mb-4">
              <h3 className="font-semibold mb-3">Python</h3>
              <div className="not-prose">
                <Streamdown>
{`\`\`\`python
import btoon

data = {"name": "Alice", "age": 30}
encoded = btoon.encode(data)
decoded = btoon.decode(encoded)
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border mb-4">
              <h3 className="font-semibold mb-3">Node.js</h3>
              <div className="not-prose">
                <Streamdown>
{`\`\`\`javascript
const btoon = require('btoon');

const data = { name: "Alice", age: 30 };
const encoded = btoon.encode(data);
const decoded = btoon.decode(encoded);
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold mb-3">JavaScript (Browser)</h3>
              <div className="not-prose">
                <Streamdown>
{`\`\`\`javascript
import { encode, decode } from '@btoon/javascript';

const data = { name: "Alice", age: 30 };
const encoded = encode(data);
const decoded = decode(encoded);
\`\`\`
`}
                </Streamdown>
              </div>
            </Card>
          </section>

          {/* System Requirements */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">System Requirements</h2>
            
            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold mb-3">Core Library</h3>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li>• C++20 compatible compiler (GCC 11+, Clang 13+, MSVC 2019+)</li>
                <li>• CMake 3.15 or higher</li>
                <li>• zlib development headers</li>
                <li>• Linux, macOS, or Windows</li>
              </ul>
              
              <h3 className="font-semibold mb-3">Language Bindings</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Python:</strong> Python 3.7+, pybind11</li>
                <li>• <strong>Node.js:</strong> Node.js 14+, node-gyp</li>
                <li>• <strong>JavaScript:</strong> Modern browser with WebAssembly support</li>
                <li>• <strong>Go:</strong> Go 1.18+, cgo enabled</li>
                <li>• <strong>PHP:</strong> PHP 7.4+, php-dev</li>
              </ul>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
