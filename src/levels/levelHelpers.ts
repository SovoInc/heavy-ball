/**
 * TrackBuilder — chain-based level construction helper.
 *
 * Maintains a cursor (x, y, z) and heading. Call straight(), right(), left()
 * to append segments. Heading 0 = moving in -Z direction.
 *
 * Only supports cardinal headings (multiples of 90°) for straight segments.
 * Curves can be any angle but 90° and 180° are recommended.
 */

import type { PathSegmentDef } from "../objects/Path";
import type { CurvedPathSegmentDef } from "../objects/CurvedPath";
import { SurfaceType } from "../objects/Path";

export { SurfaceType };

/* Re-export types for convenient one-line imports in level files */
export type { PathSegmentDef, CurvedPathSegmentDef };
export type { LevelData } from "./Level";
export type { ObstacleDef } from "../objects/Obstacle";
export type { LatticeWallDef } from "../objects/LatticeWall";
export type { WindZoneDef } from "../objects/WindZone";
export type { TimedGateDef } from "../objects/TimedGate";
export type { TeleportPairDef } from "../objects/TeleportPad";

// ── Round helper ──────────────────────────────────────────────────
function r(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ── TrackBuilder ──────────────────────────────────────────────────
export class TrackBuilder {
  x: number;
  y: number;
  z: number;
  heading: number; // radians — 0 = -Z, π/2 = +X, π = +Z, -π/2 = -X
  W: number;
  H: number;
  paths: PathSegmentDef[];
  curvedPaths: CurvedPathSegmentDef[];

  constructor(x = 0, y = 0, z = 2, w = 6, h = 0.5) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.heading = 0;
    this.W = w;
    this.H = h;
    this.paths = [];
    this.curvedPaths = [];
  }

  /** Add a straight segment in the current heading direction. */
  straight(length: number, opts: Partial<PathSegmentDef> = {}): this {
    const dx = Math.sin(this.heading);
    const dz = -Math.cos(this.heading);
    const cx = this.x + (length / 2) * dx;
    const cz = this.z + (length / 2) * dz;

    const isXAligned = Math.abs(dx) > Math.abs(dz);
    const size: [number, number, number] = isXAligned
      ? [length, this.H, this.W]
      : [this.W, this.H, length];

    this.paths.push({
      position: [r(cx), r(this.y), r(cz)],
      size: [r(size[0]), r(size[1]), r(size[2])],
      noWalls: true,
      ...opts,
    });

    this.x += length * dx;
    this.z += length * dz;
    return this;
  }

  /** Right turn. Default angle = π/2 (90°). */
  right(radius: number, angle = Math.PI / 2, opts: Partial<CurvedPathSegmentDef> = {}): this {
    const rx = Math.cos(this.heading);
    const rz = Math.sin(this.heading);
    const cx = this.x + radius * rx;
    const cz = this.z + radius * rz;
    const startAngle = this.heading + Math.PI;

    this.curvedPaths.push({
      center: [r(cx), r(this.y), r(cz)],
      radius,
      trackWidth: this.W,
      height: this.H,
      startAngle: r(startAngle),
      arcAngle: r(angle),
      ...opts,
    });

    const endAngle = startAngle + angle;
    this.x = cx + radius * Math.cos(endAngle);
    this.z = cz + radius * Math.sin(endAngle);
    this.heading += angle;
    this._snapHeading();
    return this;
  }

  /** Left turn. Default angle = π/2 (90°). */
  left(radius: number, angle = Math.PI / 2, opts: Partial<CurvedPathSegmentDef> = {}): this {
    const rx = Math.cos(this.heading);
    const rz = Math.sin(this.heading);
    const cx = this.x - radius * rx;
    const cz = this.z - radius * rz;
    const startAngle = this.heading;

    this.curvedPaths.push({
      center: [r(cx), r(this.y), r(cz)],
      radius,
      trackWidth: this.W,
      height: this.H,
      startAngle: r(startAngle),
      arcAngle: r(-angle),
      ...opts,
    });

    const endAngle = startAngle - angle;
    this.x = cx + radius * Math.cos(endAngle);
    this.z = cz + radius * Math.sin(endAngle);
    this.heading -= angle;
    this._snapHeading();
    return this;
  }

  /** Change Y elevation (negative = go down). */
  drop(dy: number): this {
    this.y += dy;
    return this;
  }

  /** Get the current cursor position (for placing finish zones, etc.). */
  pos(): [number, number, number] {
    return [r(this.x), r(this.y), r(this.z)];
  }

  /** Start position at the center of the first platform, 2 units above. */
  startPos(): [number, number, number] {
    const first = this.paths[0];
    if (!first) return [r(this.x), r(this.y + 2), r(this.z)];
    return [first.position[0], r(first.position[1] + 2), first.position[2]];
  }

  /** Get the center of the last straight segment added. */
  lastCenter(): [number, number, number] {
    const last = this.paths[this.paths.length - 1];
    return last.position as [number, number, number];
  }

  /** Get the current heading (useful for orienting walls perpendicular to the track). */
  lastHeading(): number {
    return this.heading;
  }

  /** Get the top surface Y of the last straight segment (for placing objects on it). */
  lastSurfaceY(): number {
    const last = this.paths[this.paths.length - 1];
    return last.position[1] + last.size[1] / 2;
  }

  /** Build a finish zone pulled back onto the last platform. */
  finish(): { position: [number, number, number]; size: [number, number, number] } {
    // Pull center back 2 units along the track so the zone is fully on the platform
    const dx = Math.sin(this.heading);
    const dz = -Math.cos(this.heading);
    return {
      position: [r(this.x - 2 * dx), r(this.y + 1.5), r(this.z - 2 * dz)],
      size: [this.W, 3, 4],
    };
  }

  /** Build output for the LevelData spread. */
  build(): { paths: PathSegmentDef[]; curvedPaths?: CurvedPathSegmentDef[] } {
    return {
      paths: this.paths,
      ...(this.curvedPaths.length > 0 ? { curvedPaths: this.curvedPaths } : {}),
    };
  }

  /** Snap heading to nearest π/2 if within tolerance. */
  private _snapHeading(): void {
    const q = Math.round(this.heading / (Math.PI / 2));
    const snapped = q * (Math.PI / 2);
    if (Math.abs(this.heading - snapped) < 0.001) {
      this.heading = snapped;
    }
  }
}
