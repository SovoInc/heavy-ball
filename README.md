# Heavy Ball

A 3D physics platformer built with Three.js + Cannon-ES, paired with a Rust/Actix-web backend for scores, achievements, and Midnight wallet auth. 100 hand-authored levels.

## Prerequisites

- **Node.js** ≥ 18
- **Rust** ≥ 1.75 with `cargo`

## Quick Start

```sh
# 1 — Start the backend (port :3002)
cd server
cargo run

# 2 — In another terminal, start the frontend (port :5173)
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173/g/heavy-ball/`), connect a Midnight wallet extension, and play.

## Controls

| Input | Action |
|---|---|
| **W / ↑** | Roll forward |
| **S / ↓** | Roll backward |
| **A / ←** | Roll left |
| **D / →** | Roll right |
| **R** | Restart level |
| Virtual joystick (touch) | Roll in joystick direction |

The selected ball **cannot jump**. Core, Reactor, Cryosphere, and Magma have distinct handling profiles; all vertical traversal comes from bounce surfaces, ramps, or gravity. Each class has its own versioned per-level records.

## Documentation

| File | Purpose |
|---|---|
| [GAME_DESIGN.md](GAME_DESIGN.md) | Design summary, mechanics, surfaces, power-ups, scoring, achievements |
| [LEVEL_DESIGN.md](LEVEL_DESIGN.md) | Level authoring rules (gaps, ramps, surface lengths, etc.) |
| [BUILD.md](BUILD.md) | Production build + deploy guide |
| [ANTI_CHEAT.md](ANTI_CHEAT.md) | Server-side anti-cheat architecture |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | Known limitations and operational notes |
| [CREDITS.md](CREDITS.md) | Asset and dependency credits |

## Project structure

```
heavy_ball/
├── src/                    Frontend TypeScript
│   ├── main.ts             Bootstrap
│   ├── config.ts           All tunable constants
│   ├── renderer.ts         Three.js scene + render loop
│   ├── physics.ts          Cannon-ES world + collision wiring
│   ├── controls.ts         Keyboard + touch joystick
│   ├── camera.ts           Camera follow
│   ├── hud.ts              HUD + menu DOM
│   ├── audio.ts            Procedural SFX
│   ├── api.ts              Backend client (auth, sessions, scores)
│   ├── midnight.ts         Midnight wallet connect
│   ├── objects/            Ball, Path, Obstacle, Bridge, WindZone, …
│   ├── powerups/           Power-up manager + types
│   ├── elemental/          Fire + Ice buildup system
│   ├── levels/             Level1.ts … Level100.ts + LevelManager
│   └── *.test.ts           Vitest tests (levels, physics, surfaces)
├── server/                 Rust backend
│   ├── src/
│   │   ├── main.rs         HTTP server bootstrap
│   │   ├── api.rs          /api/*  — game client endpoints
│   │   ├── metrics_api.rs  /metrics/*  — PRC-6 platform API
│   │   ├── achievements_api.rs  /achievements/*  — PRC-1 API
│   │   ├── db.rs           SQLite schema + queries
│   │   ├── session.rs      JWT session management
│   │   └── rate_limit.rs   Per-IP rate limiter
│   └── Cargo.toml
├── public/assets/          Logo + menu background
├── index.html              Entry point
├── package.json
└── vite.config.ts          base: "/g/heavy-ball/", proxies /api to :3002
```

## API surface

| Endpoint | Description |
|---|---|
| `POST /api/wallet` | Register / login by Midnight wallet address |
| `POST /api/session/start` | One-time session token for a level attempt |
| `POST /api/scores` | Submit a run with a signed score JWT |
| `GET /api/scores/top` | Per-level leaderboard |
| `GET /api/leaderboard` | Global player leaderboard (scoped by network) |
| `GET /api/stats/player/:id` | Cumulative stats |
| `GET /api/progress/:player_id` | Player's max level + total time |
| `GET /api/achievements/:player_id` | Player achievement progress |
| `GET /metrics/app` | App metadata (PRC-6) |
| `GET /metrics/channels` | Ranking channels (PRC-6) |
| `GET /achievements/public/list` | All achievement definitions (PRC-1) |
| `GET /achievements/wallet/:id` | Player achievement progress (PRC-1) |

## Build

```sh
npm install
npm run build              # frontend → dist/
cd server && cargo build --release   # binary → server/target/release/
```

See [BUILD.md](BUILD.md) for deploy configurations (single-process vs. split static host).

## Tests

```sh
npm test                   # vitest — verifies all 100 levels are playable
cd server && cargo test    # rust unit tests
```

## Midnight Network

The frontend connects to `preview` by default. Override with `VITE_MIDNIGHT_NETWORK_ID=mainnet` at build time. Mainnet is supported; network is auto-detected from the connected wallet.
