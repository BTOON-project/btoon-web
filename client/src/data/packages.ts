// Release status of every BTOON library, shown on Home, Downloads and Docs.
// Update this file (and only this file) when a version is published.
// Last checked: 2026-11-14. Every library implements spec 0.3 (versions 0.3.x).

export interface PackageLink {
  /** Link text: the registry's or the download page's name. */
  label: string;
  href: string;
  /** "registry" for a package page, "download" for prebuilt binaries. */
  kind: "registry" | "download";
}

export interface PackageInfo {
  id: "core" | "python" | "nodejs" | "javascript" | "go" | "php";
  language: string;
  /** Package or module name, as you install it. */
  name: string;
  /** Where it is published: vcpkg, PyPI, npm, ... */
  registry: string;
  /** The package's registry page first, then any downloads. The repository is `repo`. */
  links: readonly PackageLink[];
  repo: string;
  summary: string;
  install: string;
  /** How to use it after installing, when the install command alone doesn't say. */
  usage?: { title: string; lang: string; code: string };
  /** True once a release is on the registry (for Go: once it is tagged). */
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
    name: "btoon",
    registry: "vcpkg",
    links: [
      // Switch to https://vcpkg.io/en/package/btoon once vcpkg.io lists the port (it updates every few weeks).
      { label: "vcpkg", href: "https://github.com/microsoft/vcpkg/tree/master/ports/btoon", kind: "registry" },
      { label: "CLI downloads", href: `${GH}/btoon-core/releases/latest`, kind: "download" },
    ],
    repo: `${GH}/btoon-core`,
    summary: "Reference implementation, the spec and the conformance vectors. C++20 library plus the btoon CLI.",
    install: "vcpkg install btoon",
    usage: {
      title: "Use from CMake",
      lang: "cmake",
      code: `find_package(btoon CONFIG REQUIRED)
target_link_libraries(app PRIVATE btoon::btoon_core)`,
    },
    published: true,
    status: "0.3.0 is the latest release. Its GitHub release has the btoon CLI prebuilt for Linux (x64, arm64), macOS and Windows. vcpkg has 0.1.4 so far (updated 2026-11-14; run git pull in your vcpkg clone if it isn't found), with optional features brotli, lz4, snappy and zstd; the update to 0.3.0 follows.",
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
    links: [{ label: "PyPI", href: "https://pypi.org/project/btoon/", kind: "registry" }],
    repo: `${GH}/btoon-python`,
    summary: "Native extension over btoon-core (pybind11).",
    install: "pip install btoon",
    published: true,
    status: "0.3.0 is on PyPI, built on btoon-core 0.3.0, with wheels for CPython 3.10–3.15 and free-threaded 3.14t and 3.15t on Linux (x86_64, aarch64; glibc and musl), macOS (arm64, x86_64) and Windows (x64).",
    fromSource: `pip install "git+https://github.com/BTOON-project/btoon-python"   # needs a C++20 compiler and CMake`,
    requirements: "Python 3.10+. Building from source needs a C++20 compiler and CMake 3.20+.",
  },
  {
    id: "nodejs",
    language: "Node.js",
    name: "btoon",
    registry: "npm",
    links: [{ label: "npm", href: "https://www.npmjs.com/package/btoon", kind: "registry" }],
    repo: `${GH}/btoon-nodejs`,
    summary: "Native Node-API addon over btoon-core. Same API as @btoon/js.",
    install: "npm install btoon",
    published: true,
    status: "0.3.0 is on npm, built on btoon-core 0.3.0, with prebuilt binaries for Linux x64 (glibc 2.28+ and musl), Linux arm64 (glibc 2.28+), macOS (arm64, x64) and Windows (x64). For most Node.js apps @btoon/js is the faster choice.",
    fromSource: `git clone --recursive https://github.com/BTOON-project/btoon-nodejs.git
cd btoon-nodejs
npm install && npm run build && npm test`,
    requirements: "Node.js 18+. Building from source needs a C++20 compiler and Python for node-gyp; with npm 12, approve the build first (npm install-scripts approve btoon, then npm rebuild btoon).",
  },
  {
    id: "javascript",
    language: "JavaScript / TypeScript",
    name: "@btoon/js",
    registry: "npm",
    links: [{ label: "npm", href: "https://www.npmjs.com/package/@btoon/js", kind: "registry" }],
    repo: `${GH}/btoon-javascript`,
    summary: "Pure TypeScript, zero dependencies. Browsers, Node.js, Deno, Bun and edge runtimes. Runs this site's playground.",
    install: "npm install @btoon/js",
    published: true,
    status: "0.3.0 is on npm, published from GitHub Actions with provenance. It also runs this site's playground.",
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
    links: [{ label: "pkg.go.dev", href: "https://pkg.go.dev/github.com/BTOON-project/btoon-go", kind: "registry" }],
    repo: `${GH}/btoon-go`,
    summary: "Pure Go, standard library only. Optional codecs package for LZ4, Zstandard, Brotli and Snappy.",
    install: "go get github.com/BTOON-project/btoon-go",
    published: true,
    status: "v0.3.0 is tagged and served by the Go module proxy.",
    fromSource: `git clone https://github.com/BTOON-project/btoon-go.git
cd btoon-go && go test ./...`,
    requirements: "Go 1.25+. No cgo.",
  },
  {
    id: "php",
    language: "PHP",
    name: "btoon/btoon",
    registry: "Packagist",
    links: [{ label: "Packagist", href: "https://packagist.org/packages/btoon/btoon", kind: "registry" }],
    repo: `${GH}/btoon-php`,
    summary: "Pure PHP, no C extension.",
    install: "composer require btoon/btoon",
    published: true,
    status: "0.3.0 is on Packagist.",
    fromSource: `git clone https://github.com/BTOON-project/btoon-php.git
cd btoon-php && composer install && composer test`,
    requirements: "PHP 8.2+ (64-bit) with ext-zlib. ext-mbstring and ext-gmp are optional speedups.",
  },
];
