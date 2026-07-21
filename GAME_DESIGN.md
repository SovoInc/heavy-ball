# Heavy Ball — Game Design Summary & Ruleset

A 3D physics platformer. The player chooses a ball class, then rolls it along a procedurally lit, sci-fi-styled track and must reach the green finish zone without falling off. There are 100 hand-authored levels of increasing difficulty. Time is tracked per level and immutable ball physics version; faster like-for-like runs rank higher on the per-network leaderboard.

This document covers design pillars, mechanics, and the gameplay ruleset. For level-authoring rules (gap sizes, surface lengths, etc.), see [LEVEL_DESIGN.md](LEVEL_DESIGN.md). For server-side anti-cheat, see [ANTI_CHEAT.md](ANTI_CHEAT.md).

---

## Design pillars

1. **Roll, don't jump.** The ball cannot jump under any input. All vertical traversal comes from bounce surfaces, ramps, or gravity. This constraint forces the player to read the geometry and commit to lines rather than rely on platforming reflexes.
2. **Physics is honest.** Cannon-ES drives all motion. There is no "gameplay layer" overriding physics — friction, restitution, and gravity are the rules.
3. **Skill expression through speed control.** Maximum rolling speed is asymptotic, so most levels are won by managing momentum, not by pushing forward harder.
4. **Failure is cheap.** Falling off respawns the ball at the start of the level with no penalty other than the run timer. Death-to-retry loop is under two seconds.

---

## Win / lose conditions

- **Win:** Ball enters the green `FinishZone` collider. Server validates the run, records the time, and unlocks the next level.
- **Lose:** Ball falls below `world.fallThreshold` (y = -10) or is destroyed by lava. The level restarts; the timer resets.
- **Level lock:** Level N is only playable if level N-1 has been completed. Enforced server-side; see [ANTI_CHEAT.md](ANTI_CHEAT.md) §6.

---

## Controls

| Input | Action |
|---|---|
| **W / ↑** | Roll forward (away from camera) |
| **S / ↓** | Roll backward |
| **A / ←** | Roll left |
| **D / →** | Roll right |
| **R** | Restart level |
| Touch — virtual joystick (bottom-right) | Roll in joystick direction |

There is no jump key. There is no dash key. There is no brake — release input to coast.

---

## Ball physics

All values defined in [`src/config.ts`](src/config.ts).

| Property | Value | Notes |
|---|---|---|
| Radius | 0.5 | Ball center sits 0.5 above platform top |
| Mass | 8 | Heavy enough to ignore wind in narrow doses |
| Move force | 35 | Force applied per input axis |
| Max speed | 14 | Asymptotic — typical WASD speed ~5–7 due to force tapering |
| Linear damping | 0.15 | Coasts a short distance after release |
| Angular damping | 0.3 | Rolling settles quickly |
| Gravity | -20 | Falls fast |
| Fixed timestep | 1/60s | Up to 10 substeps per frame for stability |

**Implication for level design:** design crossings around `maxSpeed * 0.5 ≈ 7`, not 14. See [LEVEL_DESIGN.md](LEVEL_DESIGN.md) for gap, ramp, and surface-length rules.

---

## Surface types

| Surface | Behavior | Key tuning |
|---|---|---|
| Normal | Standard friction (0.2), low bounce (0.05) | — |
| **Ice** | Very low friction (0.02), slightly bouncy | Pair with wind zones or curves for difficulty |
| **Lava** | Kills the ball after 1.5s of continuous contact | Keep segments ≤ 7 units long |
| **Bounce** | Vertical impulse on contact (impulse 18 ≈ 8.1 unit max height) | Use for height transitions |
| **Speed** | Continuous directional force (magnitude 7) in `direction` | Set `direction: [x, y, z]` (normalized) |
| **Crumbling** | Disappears 2.0s after first contact, respawns 3.0s after fall | Keep crossable length ≤ 12 units |
| **Teleport** | Pairs two pads; ball entering A re-emerges at B | Used sparingly for routing puzzles |
| **Magnet** | Pulls ball toward pad (force 15) | Combine with ice / wind for tension |
| **Invisible** | Walkable but not rendered | Visibility cycle is per-level constant |

Colors are defined in `config.surfaces` for consistency across levels.

---

## Obstacles

| Object | Behavior |
|---|---|
| `Obstacle` (breakable box) | Breaks when hit at speed > 5. Spawns debris and optionally drops a power-up. Can be `moving` along a single axis. |
| `LatticeWall` | Wall with a fixed gap; ball must thread through. |
| `Bridge` | Narrow walkway with rails (rails are ~0.3 tall — visual cue only). |
| `WindZone` | Continuous push force in a region. |
| `TimedGate` | Opens and closes on a fixed cycle; mistime and the ball is blocked. |
| `CurvedPath` | Curved walkable surface; physics body matches the curve. |

To break a box, the ball needs `speedThreshold = 5` along the impact axis. This means power-up drops are gated by player skill, not luck.

---

## Power-ups

Defined in [`src/powerups/PowerUpType.ts`](src/powerups/PowerUpType.ts) and tuned in `config.powerUp`.

| Power-up | Effect | Duration |
|---|---|---|
| **Time Bonus** | Subtracts 3,000 ms from the run timer | Instant |
| **Speed Boost** | Force × 1.5 | 5s |
| **Shield** | Survive one lava contact / fall | 6s |
| **Time Freeze** | Pauses crumbling and timed-gate timers | 8s |

Drop chance from a broken box: **60%** (`dropChance: 0.6`). The specific drop is chosen by the level author per box.

---

## Elemental buildup system

Elemental state transforms the whole selected ball rather than applying a flat tint. Fire and ice progress through four readable quarter stages: the base material, each profile's signature accents, and a restrained stress-shell lattice shift together; threshold crossings coordinate a short sound, HUD pulse, and world-space energy ring. Touching the opposing element while buildup remains produces a thermal-shock steam cue. Reduced-motion mode suppresses the HUD movement while retaining color/state information.

A secondary state layer the ball accumulates from prolonged contact with specific surfaces and effects. Both meters drain when not building.

### Fire (red meter)
- Builds while rolling at high speed, especially on Speed surfaces.
- At max buildup: force multiplier up to ×1.8, steering sensitivity ×2.5, random spasms (force 45) at 12% chance/frame, and 4% chance/frame of full direction reversal above 60% buildup.
- Achievement: **Overheated** at first max. **Tempered** if maxed alongside Ice in the same run.

### Ice (blue meter)
- Builds while rolling on Ice surfaces or being slowed.
- At max buildup: 2.0s freeze (controls locked).
- Achievement: **Frozen Solid** at first max.

This system gives long levels a runaway-state dimension: pushing too hard or too cautiously both fail in different ways.

---

## Scoring & leaderboards

- **Ball classes:** Core/Balanced, Reactor/Heavy, Cryosphere/Light, and Magma/Elastic use distinct mass, drive, speed, damping, grip, and rebound profiles.
- **Per-ball records:** per-level scores are partitioned by `ball_id` and `physics_version`. Existing scores are `core:v1`; released profiles are versioned rather than silently retuned.
- **Run binding:** the server-issued session binds the chosen ball/version before play, and score submission must match it.

- **Per-level metric:** `time_ms` (run duration in milliseconds).
- **Leaderboard:** `GET /api/leaderboard` returns players ranked by `max_level` (primary) then `total_time_ms` (secondary, ascending).
- **Per-level top scores:** `GET /api/scores/top?limit=N`.
- **Leaderboards are scoped by Midnight `network_id`.** A player on `preview` and a player on `mainnet` do not compete with each other.

Run-time validation bounds (server-enforced; see [ANTI_CHEAT.md](ANTI_CHEAT.md) §5):

| Field | Min | Max |
|---|---|---|
| `level` | 1 | 100 |
| `time_ms` | 3,000 (3s) | 3,600,000 (1h) |
| `boxes_broken` | 0 | 500 |
| `power_ups_collected` | 0 | 200 |
| `fall_count` | 0 | 1,000 |
| `speed_boosts` | 0 | 500 |

`time_ms` is also checked against wall-clock elapsed since session start, with a 60s tolerance for Time Bonus power-ups.

---

## Achievements

Defined in [`server/src/achievement_defs.rs`](server/src/achievement_defs.rs). Evaluated server-side after each successful run.

| Key | Display | Description | Tier |
|---|---|---|---|
| `first_finish` | First Finish | Complete any level. | Beginner |
| `getting_started` | Getting Started | Complete 10 levels. | Bronze |
| `halfway_there` | Halfway There | Complete 50 levels. | Silver |
| `completionist` | Completionist | Complete all 100 levels. | Diamond |
| `speed_demon` | Speed Demon | Complete any level in < 10s. | Gold |
| `no_fall` | No Fall | Complete a level without falling. | Silver |
| `box_smasher` | Box Smasher | Break 50 boxes total. | Bronze |
| `demolition_expert` | Demolition Expert | Break 200 boxes total. | Gold |
| `power_collector` | Power Collector | Collect 25 power-ups total. | Bronze |
| `persistent` | Persistent | Fall 100 times total. | Bronze |
| `fire_maxed` | Overheated | Max fire buildup in a single level. | Silver |
| `ice_maxed` | Frozen Solid | Max ice buildup in a single level. | Silver |
| `tempered` | Tempered | Max both fire and ice in the same level. | Gold |

---

## Identity & networks

Players authenticate with a Midnight wallet (Lace, 1AM, Nocy, Nocturne — anything implementing the Midnight DApp Connector API). The shielded wallet address is the player ID. There is no email, no password, no separate account system.

- Default network: `preview` (override with `VITE_MIDNIGHT_NETWORK_ID`).
- Mainnet is supported; the network is auto-detected from the connected wallet and propagated as `caip2` in PRC-6 metrics.
- A `?guest` query param allows wallet-free local play (scores are not submitted).

See [ANTI_CHEAT.md](ANTI_CHEAT.md) for token lifecycle, session JWTs, and HMAC score signing.

---

## Aesthetic

- **Visual:** dark sci-fi, low-poly geometry, emissive surface accents (lava red, ice cyan, magnet violet). Orbitron + Inter type. Sky gradient `#010104 → #050510`.
- **Audio:** procedural SFX for rolls, surface impacts, breaks, power-up pickups. No music track bundled (`audio.ts` plays effect samples only).
- **HUD:** level name + timer (top), restart button (top-right), elemental buildup meters during play, finish overlay with run time and personal best.

---

## Reference: code locations

| Topic | File |
|---|---|
| Physics tuning | [`src/config.ts`](src/config.ts) |
| Ball behavior | [`src/objects/Ball.ts`](src/objects/Ball.ts) |
| Surface types | [`src/objects/Path.ts`](src/objects/Path.ts), `src/surfaces.test.ts` |
| Power-ups | [`src/powerups/`](src/powerups/) |
| Elemental | [`src/elemental/ElementalBuildup.ts`](src/elemental/ElementalBuildup.ts) |
| Level data | [`src/levels/Level1.ts`](src/levels/Level1.ts) … `Level100.ts`, [`src/levels/Level.ts`](src/levels/Level.ts) |
| Server scoring | [`server/src/api.rs`](server/src/api.rs) |
| Server achievements | [`server/src/achievement_eval.rs`](server/src/achievement_eval.rs) |
