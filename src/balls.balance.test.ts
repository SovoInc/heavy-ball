import { describe, expect, it } from "vitest";
import * as CANNON from "cannon-es";
import { BALL_IDS, BALL_PROFILES, type BallProfile } from "./balls";
import { CONFIG } from "./config";

const DT = 1 / 60;

function makeBody(profile: BallProfile) {
  const body = new CANNON.Body({
    mass: profile.mass,
    shape: new CANNON.Sphere(CONFIG.ball.radius),
    linearDamping: profile.linearDamping,
    angularDamping: profile.angularDamping,
  });
  return body;
}

function simulateDrive(profile: BallProfile, seconds: number) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
  const body = makeBody(profile);
  world.addBody(body);
  for (let i = 0; i < seconds / DT; i++) {
    const speed = body.velocity.length();
    const taper = Math.max(0, 1 - speed / profile.maxSpeed);
    body.applyForce(new CANNON.Vec3(0, 0, -profile.moveForce * taper));
    world.step(DT);
    if (body.velocity.length() > profile.maxSpeed) {
      body.velocity.scale(profile.maxSpeed / body.velocity.length(), body.velocity);
    }
  }
  return body.velocity.length();
}

function simulateCoast(profile: BallProfile, seconds: number) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
  const body = makeBody(profile);
  body.velocity.set(0, 0, -10);
  world.addBody(body);
  for (let i = 0; i < seconds / DT; i++) world.step(DT);
  return body.velocity.length();
}

function simulateTurn(profile: BallProfile, seconds: number) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
  const body = makeBody(profile);
  body.velocity.set(0, 0, -8);
  world.addBody(body);
  for (let i = 0; i < seconds / DT; i++) {
    const speed = body.velocity.length();
    const taper = Math.max(0, 1 - speed / profile.maxSpeed);
    body.applyForce(new CANNON.Vec3(profile.moveForce * profile.steeringMultiplier * taper, 0, 0));
    world.step(DT);
  }
  return Math.atan2(Math.abs(body.velocity.x), Math.abs(body.velocity.z)) * 180 / Math.PI;
}

function simulateGroundBounce(profile: BallProfile) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, CONFIG.physics.gravity, 0) });
  const ballMaterial = new CANNON.Material("ball");
  const groundMaterial = new CANNON.Material("ground");
  world.addContactMaterial(new CANNON.ContactMaterial(ballMaterial, groundMaterial, {
    friction: Math.min(1, CONFIG.physics.groundFriction * profile.gripMultiplier),
    restitution: Math.min(1.35, CONFIG.physics.groundRestitution * profile.restitutionMultiplier),
  }));
  const ground = new CANNON.Body({ mass: 0, material: groundMaterial, shape: new CANNON.Plane() });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(ground);
  const ball = makeBody(profile);
  ball.material = ballMaterial;
  ball.position.set(0, 3, 0);
  world.addBody(ball);
  let contacted = false;
  let peakAfterContact: number = CONFIG.ball.radius;
  for (let i = 0; i < 5 / DT; i++) {
    world.step(DT);
    if (ball.position.y <= CONFIG.ball.radius + 0.04) contacted = true;
    if (contacted) peakAfterContact = Math.max(peakAfterContact, ball.position.y);
  }
  return peakAfterContact - CONFIG.ball.radius;
}

describe("ball balance benchmarks", () => {
  it("gives Light the fastest launch and Heavy the slowest", () => {
    const speeds = Object.fromEntries(BALL_IDS.map((id) => [id, simulateDrive(BALL_PROFILES[id], 0.75)]));
    expect(speeds.light).toBeGreaterThan(speeds.magma);
    expect(speeds.magma).toBeGreaterThan(speeds.core);
    expect(speeds.core).toBeGreaterThan(speeds.heavy);
    expect(speeds.heavy).toBeGreaterThan(1.5);
  });

  it("lets every ball approach a useful racing speed", () => {
    const racingSpeeds = Object.fromEntries(BALL_IDS.map((id) => [id, simulateDrive(BALL_PROFILES[id], 8)]));
    for (const id of BALL_IDS) {
      const speed = racingSpeeds[id];
      expect(speed, id).toBeGreaterThan(8);
      expect(speed, id).toBeLessThanOrEqual(BALL_PROFILES[id].maxSpeed + 0.01);
    }
    expect(racingSpeeds.magma).toBeGreaterThan(racingSpeeds.heavy);
    expect(racingSpeeds.heavy).toBeGreaterThan(racingSpeeds.core);
    expect(racingSpeeds.core).toBeGreaterThan(racingSpeeds.light);
  });

  it("makes Heavy retain momentum and Light shed it", () => {
    const retained = Object.fromEntries(BALL_IDS.map((id) => [id, simulateCoast(BALL_PROFILES[id], 2)]));
    expect(retained.heavy).toBeGreaterThan(retained.magma);
    expect(retained.magma).toBeGreaterThan(retained.core);
    expect(retained.core).toBeGreaterThan(retained.light);
    expect(retained.light).toBeGreaterThan(5);
  });

  it("makes Light turn sharply while Heavy commits to its line", () => {
    const angles = Object.fromEntries(BALL_IDS.map((id) => [id, simulateTurn(BALL_PROFILES[id], 0.8)]));
    expect(angles.light).toBeGreaterThan(angles.core);
    expect(angles.core).toBeGreaterThan(angles.magma);
    expect(angles.magma).toBeGreaterThan(angles.heavy);
    expect(angles.heavy).toBeGreaterThan(5);
    expect(angles.light).toBeLessThan(50);
  });

  it("makes Magma visibly elastic without turning normal floors into launch pads", () => {
    const bounce = Object.fromEntries(BALL_IDS.map((id) => [id, simulateGroundBounce(BALL_PROFILES[id])]));
    expect(bounce.magma).toBeGreaterThan(bounce.light * 2);
    expect(bounce.magma).toBeGreaterThan(0.15);
    expect(bounce.magma).toBeLessThan(1.25);
    expect(bounce.heavy).toBeLessThan(0.08);
  });

  it("keeps every collider and speed inside the authored 100-level geometry contract", () => {
    for (const id of BALL_IDS) {
      const profile = BALL_PROFILES[id];
      expect(CONFIG.ball.radius, id).toBe(0.5);
      expect(profile.maxSpeed, id).toBeGreaterThanOrEqual(CONFIG.ball.maxSpeed);
      expect(profile.maxSpeed, id).toBeLessThanOrEqual(CONFIG.ball.maxSpeed * 1.15);
      expect(profile.restitutionMultiplier, id).toBeGreaterThan(0);
      expect(profile.gripMultiplier, id).toBeGreaterThanOrEqual(0.75);
      expect(profile.gripMultiplier, id).toBeLessThanOrEqual(1.25);
      expect(profile.steeringMultiplier, id).toBeGreaterThanOrEqual(0.6);
      expect(profile.steeringMultiplier, id).toBeLessThanOrEqual(1.5);
    }
  });
});
