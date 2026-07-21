import { describe, expect, it } from "vitest";
import { BALL_IDS, BALL_PROFILES, ballVersionKey } from "./balls";
import { CONFIG } from "./config";

describe("ball profiles", () => {
  it("ships the four versioned leaderboard classes", () => {
    expect(BALL_IDS).toEqual(["core", "heavy", "light", "magma"]);
    expect(new Set(BALL_IDS.map((id) => ballVersionKey(BALL_PROFILES[id]))).size).toBe(4);
  });

  it("keeps every class inside the authored course envelope", () => {
    for (const profile of Object.values(BALL_PROFILES)) {
      expect(profile.version).toBe(1);
      expect(profile.maxSpeed).toBeGreaterThanOrEqual(CONFIG.ball.maxSpeed);
      expect(profile.mass).toBeGreaterThan(0);
      expect(profile.moveForce).toBeGreaterThan(0);
    }
  });

  it("gives each class a real handling tradeoff", () => {
    expect(BALL_PROFILES.heavy.mass).toBeGreaterThan(BALL_PROFILES.core.mass);
    expect(BALL_PROFILES.heavy.linearDamping).toBeLessThan(BALL_PROFILES.core.linearDamping);
    expect(BALL_PROFILES.light.mass).toBeLessThan(BALL_PROFILES.core.mass);
    expect(BALL_PROFILES.light.linearDamping).toBeGreaterThan(BALL_PROFILES.core.linearDamping);
    expect(BALL_PROFILES.magma.restitutionMultiplier).toBeGreaterThan(5);
  });
});
