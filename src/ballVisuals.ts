import * as THREE from "three";
import type { BallProfile } from "./balls";

const FIRE_EMISSIVE = new THREE.Color(0xff4a08);
const ICE_EMISSIVE = new THREE.Color(0x24bfff);

export type ElementalKind = "fire" | "ice" | "neutral";

export type ElementalVisualState = {
  kind: ElementalKind;
  intensity: number;
  stage: 0 | 1 | 2 | 3 | 4;
  accent: THREE.Color;
  shellOpacity: number;
};

export function elementalVisualState(fire: number, ice: number): ElementalVisualState {
  const kind: ElementalKind = fire > 0.01 ? "fire" : ice > 0.01 ? "ice" : "neutral";
  const intensity = THREE.MathUtils.clamp(kind === "fire" ? fire : kind === "ice" ? ice : 0, 0, 1);
  const stage = (intensity >= 1 ? 4 : Math.floor(intensity * 4)) as 0 | 1 | 2 | 3 | 4;
  const accent = new THREE.Color(kind === "fire" ? FIRE_EMISSIVE : kind === "ice" ? ICE_EMISSIVE : 0xffffff);

  return {
    kind,
    intensity,
    stage,
    accent,
    shellOpacity: kind === "neutral" ? 0 : 0.06 + stage * 0.045 + intensity * 0.12,
  };
}

/**
 * Preserve each ball's visual identity while elemental buildup develops.
 * Buildup starts near zero, so replacing emissive RGB outright would make
 * dark-bodied profiles appear unlit on their first fire/ice contact.
 */
export function elementalEmissive(
  profile: BallProfile,
  fire: number,
  ice: number,
  target = new THREE.Color(),
): THREE.Color {
  const state = elementalVisualState(fire, ice);
  target.setHex(profile.emissive);

  if (state.kind === "fire") {
    return target.lerp(FIRE_EMISSIVE, state.intensity);
  }
  if (state.kind === "ice") {
    return target.lerp(ICE_EMISSIVE, state.intensity);
  }
  return target;
}
