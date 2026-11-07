// Release status of every BTOON library, shown on Home, Downloads and Docs.
// Update this file (and only this file) when a version is published.
// Last checked: 2026-11-07. Library version 0.1.0 implements spec 0.1.

export interface PackageInfo {
  id: "core" | "python" | "nodejs" | "javascript" | "go" | "php";
  language: string;
  /** Package or module name. */
  name: string;
  /** Where it is published: PyPI, npm, ... (none for the C++ core). */
  registry?: string;
  repo: string;
  summary: string;
  /** The install command (none for the C++ core: build it or download the CLI). */
  install?: string;
  /** True once 0.1.0 is on the registry (for Go: once v0.1.0 is tagged). */
  published: boolean;
  /** Release status in one or two sentences. */
  status: string;
  /** Build or install from the repository. */
  fromSource: string;
  requirements: string;
}

const GH = "https://github.com/BTOON-project";

export const PACKAGES: readonly PackageInfo[] = [
  {
    id: "core",
    language: "C++",
    name: "btoon-core",
    repo: `${GH}/btoon-core`,
    summary: "Reference implementation, the spec and the conformance vectors. C++20 library plus the btoon CLI.",
    published: true,
    status: "Release 0.1.0 on GitHub has the btoon CLI prebuilt for Linux (x64, arm64), macOS and Windows. The library is built from source.",
    fromSource: `git clone https://github.com/BTOON-project/btoon-core.git
cd btoon-core
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j
ctest --test-dir build
cmake --install build   # library, headers, CMake package, btoon CLI`,
    requirements: "C++20 compiler (Clang 14+, GCC 11+, MSVC 2022), CMake 3.20+, zlib. LZ4, Zstandard, Brotli and Snappy are optional.",
  },
  {
    id: "python",
    language: "Python",
    name: "btoon",
    registry: "PyPI",
    repo: `${GH}/btoon-python`,
    summary: "Native extension over btoon-core (pybind11).",
    install: "pip install btoon",
    published: true,
    status: "0.1.0 is on PyPI with wheels for CPython 3.10–3.14 on Linux (x86_64, aarch64; glibc and musl), macOS (arm64, x86_64) and Windows (x64).",
    fromSource: `pip install "git+https://github.com/BTOON-project/btoon-python"   # needs a C++20 compiler and CMake`,
    requirements: "Python 3.10+. Building from source needs a C++20 compiler and CMake 3.20+.",
  },
  {
    id: "nodejs",
    language: "Node.js",
    name: "btoon",
    registry: "npm",
    repo: `${GH}/btoon-nodejs`,
    summary: "Native Node-API addon over btoon-core. Same API as @btoon/js.",
    install: "npm install btoon",
    published: true,
    status: "0.1.0 is on npm with prebuilt binaries for Linux x64 (glibc and musl), Linux arm64 (glibc), macOS (arm64, x64) and Windows (x64). For most Node.js apps @btoon/js is the faster choice.",
    fromSource: `git clone --recursive https://github.com/BTOON-project/btoon-nodejs.git
cd btoon-nodejs
npm install && npm run build && npm test`,
    requirements: "Node.js 18+. Building from source needs a C++20 compiler and Python for node-gyp.",
  },
  {
    id: "javascript",
    language: "JavaScript / TypeScript",
    name: "@btoon/js",
    registry: "npm",
    repo: `${GH}/btoon-javascript`,
    summary: "Pure TypeScript, zero dependencies. Browsers, Node.js, Deno, Bun and edge runtimes. Runs this site's playground.",
    install: "npm install @btoon/js",
    published: true,
    status: "0.1.0 is on npm, published with provenance. It also runs this site's playground.",
    fromSource: `git clone https://github.com/BTOON-project/btoon-javascript.git
cd btoon-javascript
npm install && npm run build && npm test`,
    requirements: "Any modern browser, Node.js 18+, Deno or Bun.",
  },
  {
    id: "go",
    language: "Go",
    name: "github.com/BTOON-project/btoon-go",
    registry: "Go modules",
    repo: `${GH}/btoon-go`,
    summary: "Pure Go, standard library only. Optional codecs package for LZ4, Zstandard, Brotli and Snappy.",
    install: "go get github.com/BTOON-project/btoon-go",
    published: true,
    status: "v0.1.0 is tagged and served by the Go module proxy.",
    fromSource: `git clone https://github.com/BTOON-project/btoon-go.git
cd btoon-go && go test ./...`,
    requirements: "Go 1.22+. No cgo.",
  },
  {
    id: "php",
    language: "PHP",
    name: "btoon/btoon",
    registry: "Packagist",
    repo: `${GH}/btoon-php`,
    summary: "Pure PHP, no C extension.",
    install: "composer require btoon/btoon",
    published: true,
    status: "0.1.0 is on Packagist.",
    fromSource: `git clone https://github.com/BTOON-project/btoon-php.git
cd btoon-php && composer install && composer test`,
    requirements: "PHP 8.2+ (64-bit) with ext-zlib. ext-mbstring and ext-gmp are optional speedups.",
  },
];
