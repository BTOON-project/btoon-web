import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Github } from "./GithubIcon";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/downloads", label: "Downloads" },
];

export function SiteNav() {
  const [location] = useLocation();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label="BTOON home">
          <Package className="h-6 w-6 shrink-0 text-primary" />
          <span className="text-xl font-bold">BTOON</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={location === href ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === href && "text-primary"
              )}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/BTOON-project"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="BTOON on GitHub"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            <Github className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
