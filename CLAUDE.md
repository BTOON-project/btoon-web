# btoon-web

btoon.net: a static Vite 8 + React 19 + TypeScript 7 + Tailwind 4 single-page app, routed with
wouter and deployed on Vercel. There is no server code: the playground runs @btoon/js in
the browser.

## Commands

```bash
pnpm install && pnpm check && pnpm test && pnpm build
```

- **The workspace is on an SMB share**, and pnpm's `node_modules` symlinks fail there.
  Build and test in a copy on local disk, for example
  `rsync -a --delete --exclude node_modules --exclude dist ./ $SCRATCH/web/`, then run pnpm
  there. Copy `pnpm-lock.yaml` back if it changed.
- `pnpm test` (Vitest) includes `client/src/lib/analyze.test.ts`, which pins the byte
  counts quoted in the page copy. If you change an example, update the test.

## Rules

- **Facts come from the source of truth.** Format details follow `btoon-core/docs/SPEC.md`.
  Benchmark numbers come from the libraries' READMEs, with source, machine and date
  (`client/src/data/benchmarks.ts`). Release status is in `client/src/data/packages.ts`.
  Don't invent numbers.
- **`@btoon/js` comes from npm.** Bump it in `package.json` when btoon-javascript
  releases. Vite resolves its `browser` export, the portable entry with no `node:` imports.
- **Links:** use wouter's `<Link>` directly; it renders the `<a>`. For buttons, use
  `<Button asChild><Link …/></Button>`. Never nest an `<a>` inside `<Link>`.
- **Load heavy code lazily.** Pages other than Home, the Playground, the LiveBenchmark and
  highlight.js are all lazy. Keep the main bundle free of @btoon/js and @msgpack/msgpack.
- `components/ui/` holds only the shadcn components in use. Add others with the shadcn CLI
  as needed.
