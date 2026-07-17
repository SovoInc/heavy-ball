import { describe, expect, it } from "vitest";
import { BACKGROUND_THEMES, findBackgroundTheme, pickBackgroundTheme } from "./backgrounds/BackgroundCatalog";
import { BACKGROUND_LAYER_SPECS, calculateParallaxOffset, coverRepeatX, frustumHeightAt } from "./backgrounds/BackgroundManager";

describe("Heavy Ball backgrounds", () => {
  it("keeps the original starfield alongside five scenic themes", () => {
    expect(BACKGROUND_THEMES).toHaveLength(6);
    expect(BACKGROUND_THEMES[0]).toEqual({
      id: "procedural-starfield",
      name: "Original Starfield",
      kind: "procedural",
    });
    expect(BACKGROUND_THEMES.filter((theme) => theme.kind === "scenic")).toHaveLength(5);
  });

  it("can select every theme across the random range", () => {
    const selected = BACKGROUND_THEMES.map((_, index) =>
      pickBackgroundTheme(() => (index + 0.5) / BACKGROUND_THEMES.length).id,
    );
    expect(selected).toEqual(BACKGROUND_THEMES.map((theme) => theme.id));
  });

  it("supports forcing a known theme for visual verification", () => {
    expect(findBackgroundTheme("violet-rift")?.name).toBe("Violet Rift");
    expect(findBackgroundTheme("not-a-theme")).toBeUndefined();
  });

  it("uses distinct follow rates for visible depth motion", () => {
    expect(BACKGROUND_LAYER_SPECS.map((layer) => layer.motionFactor)).toEqual([0.0012, 0.003, 0.006]);
    expect(BACKGROUND_LAYER_SPECS.map((layer) => layer.yawFactor)).toEqual([0.05, 0.09, 0.14]);

    const offsets = BACKGROUND_LAYER_SPECS.map((layer) =>
      calculateParallaxOffset(100, layer.motionFactor),
    );

    expect(offsets[0]).toBeCloseTo(0.12);
    expect(offsets[1]).toBeCloseTo(0.3);
    expect(offsets[2]).toBeCloseTo(0.6);
    expect(offsets[2]).toBeGreaterThan(offsets[1]);
    expect(offsets[1]).toBeGreaterThan(offsets[0]);
  });

  it("sizes layers to cover the frustum and cover-crops instead of stretching", () => {
    // 55° fov at 90 units ≈ 105 world units of frustum height (with margin)
    const height = frustumHeightAt(90, 55);
    expect(height).toBeGreaterThan(2 * 90 * Math.tan((55 * Math.PI) / 360));

    // Wider plane than texture → tile horizontally at full height (no stretch)
    expect(coverRepeatX(2.4, 16 / 9)).toBeCloseTo(2.4 / (16 / 9));
    // Same aspect → exactly one repeat
    expect(coverRepeatX(16 / 9, 16 / 9)).toBeCloseTo(1);
  });
});
