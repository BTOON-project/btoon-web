import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import "highlight.js/styles/github-dark.css";

type HLJS = typeof import("highlight.js/lib/core").default;

// highlight.js core plus only the grammars this site uses, loaded on first use so
// they stay out of the main bundle.
let highlighter: Promise<HLJS> | null = null;
function loadHighlighter(): Promise<HLJS> {
  highlighter ??= (async () => {
    const [core, bash, cmake, cpp, go, javascript, json, php, python, typescript] = await Promise.all([
      import("highlight.js/lib/core"),
      import("highlight.js/lib/languages/bash"),
      import("highlight.js/lib/languages/cmake"),
      import("highlight.js/lib/languages/cpp"),
      import("highlight.js/lib/languages/go"),
      import("highlight.js/lib/languages/javascript"),
      import("highlight.js/lib/languages/json"),
      import("highlight.js/lib/languages/php"),
      import("highlight.js/lib/languages/python"),
      import("highlight.js/lib/languages/typescript"),
    ]);
    const hljs = core.default;
    for (const [name, mod] of Object.entries({ bash, cmake, cpp, go, javascript, json, php, python, typescript })) {
      hljs.registerLanguage(name, mod.default);
    }
    return hljs;
  })();
  return highlighter;
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const text = code.replace(/\n+$/, "");
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    if (lang) {
      loadHighlighter().then((hljs) => {
        if (alive && hljs.getLanguage(lang)) setHtml(hljs.highlight(text, { language: lang }).value);
      });
    }
    return () => {
      alive = false;
    };
  }, [text, lang]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group not-prose">
      <pre className="overflow-x-auto rounded-md bg-[#0d1117] p-4 text-sm leading-relaxed">
        {html ? (
          // highlight.js escapes the source; the input is static site content
          <code className={`hljs language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="hljs">{text}</code>
        )}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 rounded-md border border-white/10 bg-white/5 p-1.5 text-white/70 opacity-0 transition hover:text-white group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
