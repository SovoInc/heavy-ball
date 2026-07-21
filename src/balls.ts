export type BallId = "core" | "heavy" | "light" | "magma";

export interface BallProfile {
  id: BallId;
  version: number;
  name: string;
  role: string;
  description: string;
  mass: number;
  moveForce: number;
  maxSpeed: number;
  linearDamping: number;
  angularDamping: number;
  restitutionMultiplier: number;
  gripMultiplier: number;
  steeringMultiplier: number;
  color: number;
  emissive: number;
  trail: string;
  stats: { acceleration: number; momentum: number; control: number; bounce: number };
}

export const BALL_PROFILES: Record<BallId, BallProfile> = {
  core: {
    id: "core", version: 1, name: "Core", role: "Balanced",
    description: "The original. Precise, composed, ready for every line.",
    mass: 8, moveForce: 35, maxSpeed: 14, linearDamping: 0.15, angularDamping: 0.3,
    restitutionMultiplier: 1, gripMultiplier: 1, steeringMultiplier: 1,
    color: 0xeaf3ff, emissive: 0x172a3d, trail: "#62d9ff",
    stats: { acceleration: 65, momentum: 65, control: 70, bounce: 45 },
  },
  heavy: {
    id: "heavy", version: 1, name: "Reactor", role: "Heavy",
    description: "Slow to wake. Almost impossible to stop once it moves.",
    mass: 13, moveForce: 46, maxSpeed: 15.5, linearDamping: 0.085, angularDamping: 0.2,
    restitutionMultiplier: 0.72, gripMultiplier: 1.18, steeringMultiplier: 0.62,
    color: 0x2d3542, emissive: 0xff5a24, trail: "#ff6a3d",
    stats: { acceleration: 42, momentum: 96, control: 48, bounce: 28 },
  },
  light: {
    id: "light", version: 1, name: "Cryosphere", role: "Light",
    description: "Instant response, sharp recovery, easily thrown off line.",
    mass: 4.5, moveForce: 27, maxSpeed: 14.2, linearDamping: 0.22, angularDamping: 0.42,
    restitutionMultiplier: 1.8, gripMultiplier: 0.82, steeringMultiplier: 1.45,
    color: 0xbff7ff, emissive: 0x297dba, trail: "#bff7ff",
    stats: { acceleration: 94, momentum: 38, control: 92, bounce: 60 },
  },
  magma: {
    id: "magma", version: 1, name: "Magma", role: "Elastic",
    description: "Explosive ramps and savage rebounds. Land it or lose it.",
    mass: 7, moveForce: 36, maxSpeed: 14.5, linearDamping: 0.12, angularDamping: 0.25,
    restitutionMultiplier: 6.5, gripMultiplier: 0.92, steeringMultiplier: 0.72,
    color: 0x24100d, emissive: 0xff3d00, trail: "#ff9a32",
    stats: { acceleration: 72, momentum: 68, control: 55, bounce: 98 },
  },
};

export const BALL_IDS = Object.keys(BALL_PROFILES) as BallId[];
export const DEFAULT_BALL_ID: BallId = "core";

export function isBallId(value: string | null | undefined): value is BallId {
  return !!value && value in BALL_PROFILES;
}

export function ballVersionKey(profile: BallProfile): string {
  return `${profile.id}:v${profile.version}`;
}
