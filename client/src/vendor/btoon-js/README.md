# Vendored @btoon/js (generated, do not edit)

The `.js` and `.d.ts` files here are a copy of the **portable ESM build** of
[`@btoon/js`](https://github.com/BTOON-project/btoon-javascript) (`dist/esm`, the browser
entry with no `node:` imports). `SOURCE.json` records the version and revision.

The site imports it as `@btoon/js`. That name is an alias in `vite.config.ts` and
`tsconfig.json` that points here.

Regenerate after changing btoon-javascript:

```bash
(cd ../btoon-javascript && npm run build)
node scripts/sync-btoon-js.mjs            # or: node scripts/sync-btoon-js.mjs /path/to/btoon-javascript
```

## Why vendored

`@btoon/js` 0.1.0 is not on npm yet. The playground and the live benchmark need it in the
browser, and Vercel builds this repo on its own.

Once it is published:

1. `pnpm add @btoon/js@^0.1.0`
2. Remove the `@btoon/js` alias from `vite.config.ts` and the `paths` entry from `tsconfig.json`.
3. Delete this directory and `scripts/sync-btoon-js.mjs`.
