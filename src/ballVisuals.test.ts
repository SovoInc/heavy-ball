import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { BALL_PROFILES } from "./balls";
import { elementalEmissive, elementalVisualState } from "./ballVisuals";

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

  it.each([
    [0.24, 0], [0.25, 1], [0.5, 2], [0.75, 3], [1, 4],
  ] as const)("maps buildup %s to visual stage %s", (intensity, stage) => {
    expect(elementalVisualState(intensity, 0).stage).toBe(stage);
  });

  it("uses an elemental shell only while buildup is active", () => {
    expect(elementalVisualState(0, 0).shellOpacity).toBe(0);
    expect(elementalVisualState(0.5, 0).shellOpacity).toBeGreaterThan(0);
    expect(elementalVisualState(0, 0.5).shellOpacity).toBeGreaterThan(0);
  });
});
