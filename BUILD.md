# Heavy Ball — Build & Deploy Guide

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **Rust** ≥ 1.75 with `cargo`
- A Midnight wallet browser extension (Lace, 1AM, Nocy, Nocturne) for end-to-end testing

## Local development

Two processes — backend (Actix-web) on port `3002` and frontend (Vite) on port `5173`.

```sh
# Terminal 1 — backend
cd server
cargo run                 # listens on http://localhost:3002

# Terminal 2 — frontend
npm install
npm run dev               # serves http://localhost:5173/g/heavy-ball/
```

Open the URL the Vite output prints. The dev server proxies `/g/heavy-ball/api/*` to `localhost:3002` (configured in `vite.config.ts`).

## Production build

Two artifacts: a static frontend bundle and a release Rust binary.

```sh
# Frontend bundle → dist/
npm install
npm run build             # tsc && vite build

# Rust binary → server/target/release/heavy_ball_server (or similar)
cd server
cargo build --release
```

**Bundle layout:** `dist/` is built with `base: "/g/heavy-ball/"`, so all asset URLs assume the game is served from that path. If you need a different base, edit `vite.config.ts` and rebuild.

**Approximate sizes:** frontend JS chunk ~900 KB (213 KB gzip); full `dist/` directory ~4 MB (Three.js + Cannon-ES + Google Fonts CSS preload); release binary ~10–15 MB.

## Deploying the build

The server can either (a) serve the static bundle itself, or (b) be paired with a separate static host.

### Option A — single-process deploy (recommended)

The server's `Files::new("/", "./static").index_file("index.html")` mount in [`server/src/main.rs`](server/src/main.rs) serves any static files under `server/static/`. Copy the frontend build there:

```sh
npm run build
rm -rf server/static
mkdir -p server/static
cp -r dist/* server/static/
```

Then run the release binary. The full game is reachable at `http://<host>:<port>/g/heavy-ball/index.html` (the static mount serves the `/g/heavy-ball/` subpath because Vite emitted assets under that base).

### Option B — separate static host

Serve `dist/` from any static host (S3, Netlify, nginx). Configure the host to proxy `/g/heavy-ball/api/*`, `/g/heavy-ball/metrics/*`, and `/g/heavy-ball/achievements/*` to the Rust server. Update `vite.config.ts` to rewrite the API base if your routing differs.

## Configuration

### Frontend env vars

| Var | Default | Purpose |
|---|---|---|
| `VITE_MIDNIGHT_NETWORK_ID` | `preview` | Midnight network ID for wallet connect. Set to `mainnet` for production. |

Set at build time, e.g. `VITE_MIDNIGHT_NETWORK_ID=mainnet npm run build`.

### Server env vars

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `3002` | TCP port to bind |
| `DB_PATH` | `heavy_ball.db` | SQLite file path (relative to cwd) |

The JWT signing secret is randomly generated on each server start, which invalidates all prior session tokens. This is intentional — restarting the server is a soft kill switch for in-flight cheat attempts.

### Database

SQLite. Schema is auto-applied on startup via `Db::new()` → `init_schema()`. Migrations use a conditional `ALTER TABLE` pattern (add column only if missing). To reset all state in development: stop the server, delete `server/heavy_ball.db`, restart.

Back up the production DB before any deploy. The file is the single source of truth for scores, achievements, and auth tokens.

## Tests

```sh
npm test                  # vitest: levels, physics, surfaces
cd server && cargo test   # rust unit tests
```

Frontend tests verify all 100 levels are playable (start reachable, finish reachable, no impossible gaps, no over-long lava/crumbling). Run them before shipping any level edit.

## Verifying a release

1. `npm run build && cargo build --release` succeed with no warnings.
2. `npm test` and `cargo test` pass.
3. Start the release binary with `DB_PATH=/tmp/hb_smoke.db cargo run --release`.
4. Open `http://localhost:3002/g/heavy-ball/index.html`, connect a wallet, complete level 1, confirm the time appears on the leaderboard.
5. Verify `GET /metrics/app` and `GET /achievements/public/list` return valid JSON.
