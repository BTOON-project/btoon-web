# BTOON Web

**BTOON**, the binary transport built for the [TOON format](https://github.com/toon-format/toon#readme).  
The app is a Vite + React SPA backed by a lightweight Express static server.

## Tech Stack

- Vite 7 + React 18 + TypeScript
- TailwindCSS 4, Radix UI primitives, and custom components
- Express server for production hosting

## Getting Started

```bash
pnpm install           # install deps
pnpm run dev           # start Vite dev server on http://localhost:3000
pnpm run build         # bundle client + server
pnpm run start         # serve dist output with Express
pnpm run check         # type-check
pnpm run format        # prettier
```

## Environment Variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_APP_TITLE` | Browser tab title + fallback app label | `BTOON` |
| `VITE_APP_LOGO` | Public path/URL for the logo used across the UI | `/logo.png` |
| `VITE_ANALYTICS_ENDPOINT` | Optional analytics host injected in `index.html` | _empty_ |
| `VITE_ANALYTICS_WEBSITE_ID` | Site identifier for analytics script | _empty_ |

Create a `.env` (ignored) to override any of the values above.

## Branding Assets

All favicons and touch icons live in `client/public/`. A high-res `logo.png` is also expected in that folder and is referenced by default via `/logo.png`. Update the files and rebuild to refresh the branding.

## Deployment

1. `pnpm run build` – produces `dist/public` for the client and bundles the Express server into `dist/index.js`.
2. Run `pnpm run start` (or `node dist/index.js`) behind your HTTPS terminator/proxy.

## Contribute & Build in Public

BTOON is in early stages, so every bug report, idea, or pull request has outsized impact. If you want to help:

1. Fork the repo (or open an issue) with a short note about the change you’re exploring.
2. Use feature branches, write clear commit messages, and keep PRs focused.
3. Share context—benchmarks, screenshots, repro steps—so others can review quickly.
4. Be kind and transparent. We ship in public to learn, so prototypes, drafts, and questions are welcome.

No contribution is too small. Docs improvements, design tweaks, and roadmap suggestions are all valuable when building something new. If you are curious, start by filing an issue that describes what you’d like to improve—we’ll discuss it openly and move fast together.
