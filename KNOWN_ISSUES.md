# Heavy Ball — Known Issues & Limitations

A short list of currently known limitations. There are no open `TODO`/`FIXME` markers in the codebase and no skipped tests. Issues below are behaviors a new operator should be aware of, not unfixed bugs unless explicitly marked.

## Operational

### JWT secret resets on server restart
**Severity:** by design.
**Symptom:** any in-progress play session that was about to submit a score will receive `401` after a server restart and must start a new session.
**Reason:** the server generates a fresh JWT signing secret in `main.rs` on every boot. This is intentional anti-cheat behavior, but worth flagging for ops.
**Mitigation:** schedule restarts during low-traffic windows.

### SQLite file is the single source of truth
**Severity:** by design.
**Symptom:** all scores, auth tokens, achievement progress live in `server/heavy_ball.db`. Losing this file means losing all player state.
**Mitigation:** snapshot `heavy_ball.db` before deploys and on a recurring schedule.

### Auth tokens expire after 30 days
**Severity:** by design.
**Symptom:** players who haven't played in over 30 days are silently logged out and must reconnect their wallet.
**Mitigation:** none required. UI handles re-connect.

## Wallet / network

### Wallet extension is required for score submission
**Severity:** prerequisite, not a bug.
**Symptom:** without a Midnight wallet extension installed, the login screen shows a "Install Wallet" prompt.
**Workaround:** append `?guest` to the URL to play locally without score submission.

### Per-network leaderboards
**Severity:** by design.
**Symptom:** scores submitted from `preview` and `mainnet` do not appear on the same leaderboard.
**Reason:** scores are scoped by Midnight `network_id` so testnet runs don't pollute mainnet rankings.

## Gameplay

### Touch joystick only appears on first touch
**Severity:** minor UX.
**Symptom:** on hybrid keyboard+touch devices, the joystick is hidden until the first `touchstart` event. Players using keyboard never see it.
**File:** [`src/controls.ts`](src/controls.ts) lines 25–32.

### No pause function
**Severity:** missing feature.
**Symptom:** the run timer runs continuously while the tab is focused. There is no Esc/pause binding.
**Workaround:** use the Restart button (top-right) to reset the run.

### Restart key (R) is unbound on some keyboards
**Severity:** minor.
**Symptom:** `keydown` is captured by the canvas, so combos like Cmd+R reload the page rather than restart the level.
**Mitigation:** use the HUD restart button if keyboard binding is unreliable.

## Build / dist

### Vite base is hard-coded to `/g/heavy-ball/`
**Severity:** deploy-time configuration.
**Symptom:** the production bundle assumes it is served under `/g/heavy-ball/`. Serving from a different path 404s on assets.
**Fix:** edit `vite.config.ts` `base` and rebuild.

### Frontend bundle is not split
**Severity:** performance.
**Symptom:** initial download is ~3.6 MB (Three.js + Cannon-ES). First load on slow connections is ~3–5s.
**Mitigation:** consider dynamic-importing Cannon-ES if cold-load latency becomes a concern.

## Not bugs (informational)

- The empty `heavy_ball.db` (0 bytes) at the repo root is leftover from early development. Real DB lives at `server/heavy_ball.db`. Removed during handover cleanup.
- `dist/`, `node_modules/`, and `server/target/` are present in the working tree but gitignored — they regenerate via `npm install`, `npm run build`, and `cargo build`.
