# btoon.net

The website of [BTOON](https://github.com/BTOON-project), a compact binary serialization
format: MessagePack plus a columnar encoding for tables. It has documentation, a playground,
benchmarks and download instructions.

The site is static: a Vite + React single-page app with no server code. The playground and
the live benchmark run in the visitor's browser with
[`@btoon/js`](https://github.com/BTOON-project/btoon-javascript).

## Development

Node.js 22+ and pnpm (the version is pinned in `package.json`; `corepack enable` picks it up).

```bash
pnpm install
pnpm dev         # http://localhost:3000
pnpm check       # TypeScript (app and vite.config.ts)
pnpm test        # Vitest: formatting, playground logic, and the figures quoted on the pages
pnpm build       # dist/public
pnpm preview     # serve the build
```

## Layout

```
client/index.html            meta tags
client/public/               icons, llms.txt
client/src/pages/            Home, Docs, Benchmarks, Downloads, NotFound
client/src/components/       site chrome, Playground, LiveBenchmark, CodeBlock, ui/ (shadcn)
client/src/data/             package status and published benchmark numbers
client/src/lib/              playground logic (analysis, datasets, formatting) and tests
client/src/vendor/btoon-js/  vendored build of @btoon/js (generated, see below)
scripts/sync-btoon-js.mjs    refreshes the vendored @btoon/js
```

Pages other than Home load on demand, and so do the playground, the live benchmark and the
syntax highlighter.

## Content rules

- **Numbers** on the site are measured. Published benchmarks live in
  `client/src/data/benchmarks.ts`, each with its source README, machine and date. Figures
  quoted in page copy (for example on Home and in the Docs examples) are checked by
  `client/src/lib/analyze.test.ts`, so they can't drift from what the library produces.
- **Release status** for every library is in `client/src/data/packages.ts`. Update it when
  something is published.
- **Format facts** follow [SPEC.md](https://github.com/BTOON-project/btoon-core/blob/main/docs/SPEC.md).

## @btoon/js is vendored

`@btoon/js` 0.1.0 isn't on npm yet, so `client/src/vendor/btoon-js/` holds a copy of its
portable ESM build, which the `@btoon/js` alias points to. To refresh it after changing
btoon-javascript:

```bash
(cd ../btoon-javascript && npm run build)
pnpm sync:btoon-js
```

Once it's published, switch to the npm package as described in
`client/src/vendor/btoon-js/README.md`.

## Deployment

Vercel builds `pnpm run build` and serves `dist/public` (`vercel.json`), with a rewrite to
`index.html` for client-side routes. Analytics (Umami) load only when
`VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` are set (see `.env.example`).

## License

MIT
