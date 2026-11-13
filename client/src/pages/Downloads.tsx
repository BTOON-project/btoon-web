import { CodeBlock } from "@/components/CodeBlock";
import { Github } from "@/components/GithubIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PACKAGES } from "@/data/packages";
import { Download, Package } from "lucide-react";

const CLI = `btoon encode data.json data.btoon --compress   # JSON -> BTOON (zlib envelope)
btoon decode data.btoon -                      # BTOON -> JSON on stdout
btoon info data.btoon                          # envelope, sizes, structure
cat data.json | btoon encode - - | btoon decode - - --compact`;

export default function Downloads() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <h1 className="mb-4 flex items-center gap-3 text-4xl font-bold">
            <Download className="h-10 w-10 text-primary" />
            Downloads
          </h1>
          <p className="text-lg text-muted-foreground">
            Every library implements spec <strong className="text-foreground">0.2</strong> (versions 0.2.x).
            Each card links to the package and its repository, with the install command and how to build from source.
          </p>
        </header>

        <div className="space-y-6">
          {PACKAGES.map((p) => (
            <Card key={p.id} id={p.id} className="scroll-mt-20 gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{p.language}</h2>
                  <p className="text-sm text-muted-foreground">
                    <code>{p.name}</code> on {p.registry}. {p.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.links.map((l) => (
                    <Button key={l.href} asChild variant="outline" size="sm">
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.kind === "download" ? <Download className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        {l.label}
                      </a>
                    </Button>
                  ))}
                  <Button asChild variant="outline" size="sm">
                    <a href={p.repo} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      Repository
                    </a>
                  </Button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  Install
                  {!p.published && <Badge variant="outline">coming soon</Badge>}
                </div>
                <CodeBlock lang="bash" code={p.install} />
              </div>

              {p.usage && (
                <div>
                  <div className="mb-2 text-sm font-medium">{p.usage.title}</div>
                  <CodeBlock lang={p.usage.lang} code={p.usage.code} />
                </div>
              )}

              <div>
                <div className="mb-2 text-sm font-medium">{p.published ? "From source" : "Today"}</div>
                <p className="mb-2 text-sm text-muted-foreground">{p.status}</p>
                <CodeBlock lang="bash" code={p.fromSource} />
              </div>

              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Requirements:</strong> {p.requirements}
              </p>
            </Card>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Command-line tool</h2>
          <p className="mb-4 text-muted-foreground">
            btoon-core builds a <code>btoon</code> CLI that converts between JSON and BTOON. Types JSON lacks
            round-trip as tagged objects such as <code>{'{"$binary": "<base64>"}'}</code> and{" "}
            <code>{'{"$timestamp": "2024-01-01T00:00:00Z"}'}</code>. Prebuilt binaries for Linux, macOS and Windows
            are on the{" "}
            <a
              href="https://github.com/BTOON-project/btoon-core/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              latest GitHub release
            </a>
            .
          </p>
          <CodeBlock lang="bash" code={CLI} />
        </section>
      </div>
    </div>
  );
}
