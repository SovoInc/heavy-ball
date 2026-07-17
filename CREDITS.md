# Heavy Ball — Asset & Dependency Credits

## Bundled assets

All visual elements other than the two PNGs below are generated procedurally from Three.js geometry and shaders defined in `src/objects/visuals.ts` and per-object files in `src/objects/`. There are no bundled audio files; SFX are generated at runtime in [`src/audio.ts`](src/audio.ts).

| File | Purpose | Source / License |
|---|---|---|
| `public/assets/ball-logo.png` | Title-screen logo mark | Original artwork (project-internal). All rights reserved unless re-licensed at handover. |
| `public/assets/menu-bg.png` | Menu / login background | Original artwork (project-internal). All rights reserved unless re-licensed at handover. |

If either asset was sourced externally, replace this section with the appropriate attribution and license before handover.

## Fonts

Loaded from Google Fonts at runtime (see `index.html`):

- **Orbitron** — by Matt McInerney. SIL Open Font License 1.1.
- **Inter** — by Rasmus Andersson. SIL Open Font License 1.1.

## Runtime dependencies

From [`package.json`](package.json):

| Package | Version | License | Purpose |
|---|---|---|---|
| `three` | ^0.172.0 | MIT | 3D rendering |
| `cannon-es` | ^0.20.0 | MIT | Rigid body physics |
| `@midnight-ntwrk/dapp-connector-api` | ^4.0.1 | (Midnight Network) | Wallet connector API |
| `@midnight-ntwrk/ledger` | ^4.0.0 | (Midnight Network) | Midnight ledger interaction |

## Server dependencies

From [`server/Cargo.toml`](server/Cargo.toml):

| Crate | License | Purpose |
|---|---|---|
| `actix-web`, `actix-files` | MIT/Apache-2.0 | HTTP server |
| `rusqlite` | MIT | SQLite bindings |
| `serde`, `serde_json` | MIT/Apache-2.0 | Serialization |
| `chrono` | MIT/Apache-2.0 | Timestamps |
| `uuid` | MIT/Apache-2.0 | ID generation |
| `jsonwebtoken` | MIT | Session / score JWTs |

All third-party licenses are compatible with proprietary distribution.
