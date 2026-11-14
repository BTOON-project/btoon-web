import { Package } from "lucide-react";
import { Link } from "wouter";

const GH = "https://github.com/BTOON-project";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border py-12">
      <div className="container grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-bold">BTOON</span>
          </div>
          <p className="text-sm text-muted-foreground">
            MessagePack with a columnar encoding for tables, canonical bytes and a hardened decoder.
          </p>
        </div>
        <div>
          <h2 className="mb-4 font-semibold">Site</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
            <li><Link href="/docs#playground" className="hover:text-foreground">Playground</Link></li>
            <li><Link href="/benchmarks" className="hover:text-foreground">Benchmarks</Link></li>
            <li><Link href="/downloads" className="hover:text-foreground">Downloads</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-semibold">Project</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href={GH} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub organization</a></li>
            <li><a href={`${GH}/btoon-core/blob/main/docs/SPEC.md`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Specification (SPEC.md)</a></li>
            <li><a href="https://github.com/toon-format/toon#readme" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">TOON format</a></li>
            <li><a href="https://msgpack.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">MessagePack</a></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-semibold">Community</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href={`${GH}/btoon-core/discussions`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Questions and ideas</a></li>
            <li><a href={`${GH}/btoon-core/issues/new/choose`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Report a bug or propose a change</a></li>
            <li><Link href="/docs#feedback" className="hover:text-foreground">Versions and feedback</Link></li>
            <li><a href={`${GH}/.github/blob/main/SECURITY.md`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Security policy</a></li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
        BTOON contributors. Released under the MIT License.
      </div>
    </footer>
  );
}
