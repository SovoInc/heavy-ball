# Level Design Guide

## Level file structure

Each level exports a `LevelData` object from `src/levels/LevelN.ts`:

```ts
export const LEVEL_N: LevelData = {
  name: "Level N — Name",
  startPosition: [x, y, z],     // ball spawn point (y should be ~2 above platform)
  finishZone: { position, size }, // tall transparent box the ball rolls through
  paths: [...],                  // required: walkable platforms
  bridges?: [...],               // optional: narrow walkways
  obstacles?: [...],             // optional: breakable boxes
  latticeWalls?: [...],          // optional: walls with gaps
  windZones?: [...],             // optional: push forces
  timedGates?: [...],            // optional: opening/closing gates
};
```

Register new levels in `src/levels/LevelManager.ts` — import and add to `ALL_LEVELS`.

## Path segments

```ts
{ position: [x, y, z], size: [width, height, depth], noWalls?: boolean, surfaceType?: SurfaceType }
```

- `position` is the **center** of the box
- `size[1]` (height) is typically `0.5`
- The platform spans from `position - size/2` to `position + size/2` on each axis
- Use `CONFIG.path.wideWidth` (6) for normal width, `CONFIG.path.narrowWidth` (2.2) for narrow

## Ball physics (what the ball can and can't do)

| Property | Value | Notes |
|----------|-------|-------|
| Radius | 0.5 | Ball center sits 0.5 above platform top |
| Max speed | 14 | Asymptotic — actual WASD speed is ~5-7 due to force tapering |
| Typical rolling speed | ~7 | Half max speed is a safe design target |
| Gravity | -20 | Falls fast |

**The ball cannot jump.** It can only roll. Any height gain requires a bounce pad.

## Constraints (enforced by tests)

### Gaps between platforms

**Consecutive platforms must overlap or nearly touch.** The ball rolls — it does not jump. Any gap means the ball is in freefall.

- **Same height, no gap (overlap >= 0):** Always safe.
- **Same height, small gap (< 1.0):** Ball's sphere shape bridges it. OK but tight.
- **Same height, gap > 1.5:** Dangerous. Ball drops significantly while crossing. Avoid unless the player has speed boost or a ramp.
- **Same height, gap > 3.5:** Effectively impossible. Test will fail.

**Rule of thumb: overlap platforms by 1-2 units** rather than leaving any gap. This is especially critical after crumbling or lava surfaces where the player may not be at full speed.

### Height transitions

- **Going up > 0.6 units:** Requires a bounce pad on the source platform.
- **Going down:** The ball can drop any distance, but needs a landing platform directly below (gap < 3.5 at the drop point).
- **Bounce pad max height:** ~8.1 units (`impulse^2 / (2 * gravity)` = `18^2 / 40`).
- **Bounce pads must be at the SAME height as the preceding platform.** Don't put elevated bounce pads after ground-level segments — the ball can't climb up to reach them.

### Lava segments

**Max crossable length at half speed: ~10.5 units** (`damageTime * maxSpeed * 0.5` = `1.5 * 14 * 0.5`).

- Keep lava segments **7 units or shorter** to be safe.
- The damage timer (1.5s) starts when the ball touches lava and resets when it leaves.
- Place a safe platform immediately after (overlapping the lava end).

### Crumbling segments

**Max crossable length at half speed: ~14 units** (`delay * maxSpeed * 0.5` = `2.0 * 14 * 0.5`).

- Keep crumbling segments **12 units or shorter** to be safe.
- The crumble timer (2.0s) starts on first contact. The entire segment crumbles at once.
- **Overlap the next safe platform with the crumbling segment's end by 1-2 units.** The player must be able to roll onto safe ground without crossing a gap as the floor disappears.
- Crumbling platforms restore when the ball falls off the map or hits lava.

### Finish zone placement

- The finish zone's horizontal footprint must overlap with a walkable platform.
- Place it near the end of the last platform, not past it.
- Finish zone height (size[1]) is typically 3 — tall enough that the ball rolls through it.

### Start position

- Must be directly above a platform (within ball radius tolerance).
- Y should be ~2 above the platform surface to give the ball a short drop on spawn.

## Surface types

| Surface | SurfaceType enum | Key behavior |
|---------|-----------------|--------------|
| Normal | (default) | Standard friction |
| Ice | `SurfaceType.Ice` | Very low friction (0.02). Ball slides. Pair with wind zones for difficulty. |
| Lava | `SurfaceType.Lava` | Kills after 1.5s contact. Keep short. |
| Bounce | `SurfaceType.Bounce` | Launches ball up (impulse 18). Use for height transitions. |
| Speed | `SurfaceType.Speed` | Pushes ball in `direction`. Set `direction: [x, y, z]` (normalized). |
| Crumbling | `SurfaceType.Crumbling` | Disappears 2s after first contact. Keep crossable length under 12. |

## Obstacles

```ts
{ position, size, breakable: true, powerUp?: PowerUpType, moving?: { axis, range, speed } }
```

- Ball must hit obstacles at speed > 5 (`CONFIG.breakable.speedThreshold`) to break them.
- Place breakable obstacles on platforms where the ball has room to build speed.
- `powerUp` makes a power-up drop when the box breaks.

## Common mistakes

1. **Gap between crumbling platform and safe checkpoint.** The floor disappears — if there's a gap, the player falls. Overlap them.
2. **Lava section too long.** More than ~7 units and the player dies before crossing.
3. **Elevated bounce pad after ground-level segment.** The ball can't jump up to it. Bounce pads must be at the same height as the approach.
4. **Finish zone past the last platform edge.** Ball can't reach a finish zone that extends beyond walkable ground.
5. **Crumbling section too long.** More than ~12 units and it crumbles before the player crosses.
6. **Relying on max speed for gap crossings.** Players are often at half speed or less. Design for `maxSpeed * 0.5`.

## Running tests

```sh
npm test
```

The level playability tests (`src/levels.test.ts`) verify:
- Start position is above a platform
- Finish zone overlaps a platform
- Every platform is reachable from start (graph connectivity)
- Finish zone is reachable from start
- All lava/crumbling segments are crossable at half max speed
