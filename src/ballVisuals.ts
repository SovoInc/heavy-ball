import * as THREE from "three";
import type { BallProfile } from "./balls";

const FIRE_EMISSIVE = new THREE.Color(0xff4a08);
const ICE_EMISSIVE = new THREE.Color(0x24bfff);

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
  target.setHex(profile.emissive);

  if (fire > 0.01) {
    return target.lerp(FIRE_EMISSIVE, THREE.MathUtils.clamp(fire, 0, 1));
  }
  if (ice > 0.01) {
    return target.lerp(ICE_EMISSIVE, THREE.MathUtils.clamp(ice, 0, 1));
  }
  return target;
}
