import { CodeBlock } from "@/components/CodeBlock";
import { Github } from "@/components/GithubIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PACKAGES } from "@/data/packages";
import { Download } from "lucide-react";

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
            Library version <strong className="text-foreground">0.1.0</strong> implements spec 0.1 in every language.
            It isn't published to the package registries yet, so each card shows the command to use once it is,
            and how to install 0.1.0 today.
          </p>
        </header>

        <div className="space-y-6">
          {PACKAGES.map((p) => (
            <Card key={p.id} id={p.id} className="scroll-mt-20 gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{p.language}</h2>
                  <p className="text-sm text-muted-foreground">
                    <code>{p.name}</code>
                    {p.registry && <> on {p.registry}</>}. {p.summary}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={p.repo} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    Repository
                  </a>
                </Button>
              </div>

              {p.install && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    Install
                    <Badge variant="outline">once 0.1.0 is published</Badge>
                  </div>
                  <CodeBlock lang="bash" code={p.install} />
                </div>
              )}

              <div>
                <div className="mb-2 text-sm font-medium">{p.install ? "Today" : "Build and install"}</div>
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
            <code>{'{"$timestamp": "2024-01-01T00:00:00Z"}'}</code>.
          </p>
          <CodeBlock lang="bash" code={CLI} />
        </section>
      </div>
    </div>
  );
}
