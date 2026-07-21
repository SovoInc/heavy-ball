import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { BALL_PROFILES } from "./balls";
import { elementalEmissive } from "./ballVisuals";

function colorDistance(a: THREE.Color, b: THREE.Color): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

describe("elemental ball visuals", () => {
  it.each(Object.values(BALL_PROFILES))(
    "keeps $name emissive color at the first fire contact",
    (profile) => {
      const base = new THREE.Color(profile.emissive);
      const tinted = elementalEmissive(profile, 0.011, 0);

      expect(colorDistance(tinted, base)).toBeLessThan(0.02);
    },
  );

  it.each(Object.values(BALL_PROFILES))(
    "keeps $name emissive color at the first ice contact",
    (profile) => {
      const base = new THREE.Color(profile.emissive);
      const tinted = elementalEmissive(profile, 0, 0.011);

      expect(colorDistance(tinted, base)).toBeLessThan(0.02);
    },
  );

  it("reaches clear fire and ice colors at full buildup", () => {
    expect(elementalEmissive(BALL_PROFILES.core, 1, 0).getHex()).toBe(0xff4a08);
    expect(elementalEmissive(BALL_PROFILES.core, 0, 1).getHex()).toBe(0x24bfff);
  });
});
