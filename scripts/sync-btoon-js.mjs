#!/usr/bin/env node
// Copies the portable ESM build of @btoon/js (repo btoon-javascript) into
// client/src/vendor/btoon-js/, where the `@btoon/js` alias in vite.config.ts and
// tsconfig.json points.
//
// This is temporary. Once @btoon/js 0.1.0 is published to npm, add it as a dependency,
// remove the alias and delete the vendored copy and this script
// (see client/src/vendor/btoon-js/README.md).
//
// Usage: node scripts/sync-btoon-js.mjs [path/to/btoon-javascript]
//        (default: $BTOON_JS_DIR, then ../btoon-javascript; run `npm run build` there first)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..");
const source = path.resolve(
  process.argv[2] ?? process.env.BTOON_JS_DIR ?? path.join(webRoot, "..", "btoon-javascript")
);
const dist = path.join(source, "dist", "esm");
const target = path.join(webRoot, "client", "src", "vendor", "btoon-js");

function fail(message) {
  console.error(`sync-btoon-js: ${message}`);
  process.exit(1);
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8"));
} catch {
  fail(`no package.json in ${source}`);
}
if (pkg.name !== "@btoon/js") fail(`${source} is ${pkg.name}, not @btoon/js`);
if (!fs.existsSync(path.join(dist, "index.js"))) {
  fail(`${dist}/index.js not found: run "npm run build" in ${source} first`);
}

// Follows relative imports from an entry file. Anything else (a `node:` module or a
// package) would not work in the browser bundle, so it is an error. Declaration files
// import their siblings as "./x.js", which `toFile` maps to "x.d.ts".
function moduleGraph(entry, toFile) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    const full = path.join(dist, file);
    if (!fs.existsSync(full)) fail(`missing ${full}`);
    seen.add(file);
    const code = fs.readFileSync(full, "utf8");
    for (const match of code.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (!specifier.startsWith("./")) fail(`${file} imports "${specifier}"`);
      queue.push(toFile(path.posix.normalize(specifier)));
    }
  }
  return seen;
}

const scripts = moduleGraph("index.js", (file) => file);
const typeFiles = moduleGraph("index.d.ts", (file) => file.replace(/\.js$/, ".d.ts"));

let revision = "unknown";
try {
  revision = execFileSync("git", ["-C", source, "describe", "--always", "--dirty"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  // not a git checkout
}

fs.mkdirSync(target, { recursive: true });
for (const name of fs.readdirSync(target)) {
  if (name.endsWith(".js") || name.endsWith(".d.ts")) fs.rmSync(path.join(target, name));
}
const files = [...scripts, ...typeFiles].sort();
for (const file of files) fs.copyFileSync(path.join(dist, file), path.join(target, file));

const sourceInfo = {
  package: pkg.name,
  version: pkg.version,
  repository: "https://github.com/BTOON-project/btoon-javascript",
  revision,
  entry: "dist/esm/index.js (portable entry, no node: imports)",
  files,
};
fs.writeFileSync(path.join(target, "SOURCE.json"), `${JSON.stringify(sourceInfo, null, 2)}\n`);
console.log(`copied ${files.length} files of ${pkg.name} ${pkg.version} (${revision}) to ${path.relative(webRoot, target)}`);
