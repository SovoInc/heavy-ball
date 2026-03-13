import { describe, it, expect, beforeEach } from "vitest";
import * as CANNON from "cannon-es";
import { Physics } from "./physics";
import { CONFIG } from "./config";

// ---------------------------------------------------------------------------
// Helpers — lightweight cannon-es setup without THREE
// ---------------------------------------------------------------------------

function createBall(physics: Physics): CANNON.Body {
  const { radius, mass, linearDamping, angularDamping } = CONFIG.ball;
  const body = new CANNON.Body({
    mass,
    shape: new CANNON.Sphere(radius),
    material: physics.ballMaterial,
    linearDamping,
    angularDamping,
  });
  physics.addBody(body);
  return body;
}

function createGround(physics: Physics, y = 0, w = 20, d = 20): CANNON.Body {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(w / 2, 0.25, d / 2)),
    material: physics.groundMaterial,
  });
  body.position.set(0, y - 0.25, 0);
  physics.addBody(body);
  return body;
}

/** Edge wall — same setup as Path.addEdgeWalls */
function createWall(
  physics: Physics,
  x: number,
  y: number,
  z: number,
  thickness: number,
  height: number,
  depth: number,
): CANNON.Body {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(thickness / 2, height / 2, depth / 2)),
    material: physics.wallMaterial,
  });
  body.position.set(x, y, z);
  physics.addBody(body);
  return body;
}

function createIceGround(physics: Physics, y = 0, w = 20, d = 20): CANNON.Body {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(w / 2, 0.25, d / 2)),
    material: physics.iceMaterial,
  });
  body.position.set(0, y - 0.25, 0);
  physics.addBody(body);
  return body;
}

function createBounceGround(physics: Physics, y = 0, w = 6, d = 6): CANNON.Body {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(w / 2, 0.25, d / 2)),
    material: physics.bounceMaterial,
  });
  body.position.set(0, y - 0.25, 0);
  physics.addBody(body);
  return body;
}

function stepSeconds(physics: Physics, seconds: number) {
  const steps = Math.round(seconds / CONFIG.physics.fixedTimeStep);
  for (let i = 0; i < steps; i++) {
    physics.step(CONFIG.physics.fixedTimeStep);
  }
}

function horizontalSpeed(body: CANNON.Body): number {
  return Math.sqrt(body.velocity.x ** 2 + body.velocity.z ** 2);
}

/**
 * Mimics Controls.update force logic for a given key set and camera angle.
 * Returns the force that would be applied (before speedRatio scaling).
 */
function computeMoveForce(
  keys: Set<string>,
  cameraAngle: number,
): CANNON.Vec3 {
  const force = new CANNON.Vec3(0, 0, 0);
  const { moveForce } = CONFIG.ball;
  const sinA = Math.sin(cameraAngle);
  const cosA = Math.cos(cameraAngle);

  if (keys.has("KeyW")) { force.x += -sinA * moveForce; force.z += -cosA * moveForce; }
  if (keys.has("KeyS")) { force.x += sinA * moveForce; force.z += cosA * moveForce; }
  if (keys.has("KeyA")) { force.x += -cosA * moveForce; force.z += sinA * moveForce; }
  if (keys.has("KeyD")) { force.x += cosA * moveForce; force.z += -sinA * moveForce; }

  return force;
}

/** Apply movement force to ball (mimics Controls.update). */
function applyMove(ball: CANNON.Body, keys: Set<string>, cameraAngle: number, speedMultiplier = 1) {
  const force = computeMoveForce(keys, cameraAngle);
  if (force.length() > 0) {
    const speed = ball.velocity.length();
    const maxSpeed = CONFIG.ball.maxSpeed * speedMultiplier;
    const speedRatio = Math.max(0, 1 - speed / maxSpeed);
    force.scale(speedRatio * speedMultiplier, force);
    ball.wakeUp();
    ball.applyForce(force);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Ball & gravity", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
  });

  it("falls under gravity", () => {
    ball.position.set(0, 5, 0);
    stepSeconds(physics, 0.5);
    expect(ball.position.y).toBeLessThan(5);
  });

  it("lands on ground and stays", () => {
    createGround(physics);
    ball.position.set(0, 2, 0);
    stepSeconds(physics, 2);
    // Should be resting on the ground (ball radius 0.5, ground top at 0)
    expect(ball.position.y).toBeCloseTo(CONFIG.ball.radius, 0);
    expect(ball.velocity.y).toBeCloseTo(0, 0);
  });
});

describe("Wall collisions", () => {
  let physics: Physics;
  let ball: CANNON.Body;
  const wallThickness = 1.5; // matches Path.addEdgeWalls collision thickness

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
  });

  it("ball pushed into wall does not pass through", () => {
    // Wall at x = 3, inner face at x = 3 - thickness/2 = 2.25
    createWall(physics, 3, 1, 0, wallThickness, 2, 20);

    // Push ball toward wall for 2 seconds
    for (let i = 0; i < 120; i++) {
      ball.applyForce(new CANNON.Vec3(CONFIG.ball.moveForce, 0, 0));
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    const wallInner = 3 - wallThickness / 2;
    expect(ball.position.x).toBeLessThan(wallInner);
  });

  it("ball is not violently ejected when pushed into wall", () => {
    // Wall on the right side
    createWall(physics, 3, 1, 0, wallThickness, 2, 20);

    let maxSpeed = 0;

    // Push ball into wall at max force for 2 seconds
    for (let i = 0; i < 120; i++) {
      ball.applyForce(new CANNON.Vec3(CONFIG.ball.moveForce, 0, 0));
      physics.step(CONFIG.physics.fixedTimeStep);
      maxSpeed = Math.max(maxSpeed, horizontalSpeed(ball));
    }

    // Speed should never wildly exceed what the force can produce
    // moveForce/mass * dt ~= 0.0625 per step, maxSpeed CONFIG is 14
    expect(maxSpeed).toBeLessThan(CONFIG.ball.maxSpeed * 1.5);
  });

  it("ball sliding along wall is not pushed away from it", () => {
    // Wall on the right at x=3
    createWall(physics, 3, 1, 0, wallThickness, 2, 20);

    // Position ball near wall, give it forward velocity
    ball.position.set(1.5, CONFIG.ball.radius, 0);
    ball.velocity.set(0, 0, -8);

    const xPositions: number[] = [];
    for (let i = 0; i < 120; i++) {
      // Push slightly into wall while moving forward
      ball.applyForce(new CANNON.Vec3(CONFIG.ball.moveForce * 0.3, 0, 0));
      physics.step(CONFIG.physics.fixedTimeStep);
      xPositions.push(ball.position.x);
    }

    // Ball should stay between start and wall, not be pushed far left
    const minX = Math.min(...xPositions);
    expect(minX).toBeGreaterThan(0);
  });

  it("stationary ball touching wall is not ejected when force applied", () => {
    // Wall on the right at x=3
    createWall(physics, 3, 1, 0, wallThickness, 2, 20);

    // Place ball right at wall
    const wallInner = 3 - wallThickness / 2;
    ball.position.set(wallInner - CONFIG.ball.radius - 0.01, CONFIG.ball.radius, 0);

    // Let it settle
    stepSeconds(physics, 0.5);
    const startX = ball.position.x;

    // Push into wall
    for (let i = 0; i < 60; i++) {
      ball.applyForce(new CANNON.Vec3(CONFIG.ball.moveForce, 0, 0));
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Ball should not have been ejected far to the left
    expect(ball.position.x).toBeGreaterThan(startX - 1.5);
    // Ball should not pass through the wall
    expect(ball.position.x).toBeLessThan(wallInner);
  });
});

describe("Wall sliding — no reverse movement", () => {
  let physics: Physics;
  let ball: CANNON.Body;
  const wallThickness = 1.5;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
  });

  it("moving forward along right wall does not push ball backward", () => {
    // Wall on the right
    createWall(physics, 3, 1, 0, wallThickness, 2, 20);
    // Place ball against wall
    const wallInner = 3 - wallThickness / 2;
    ball.position.set(wallInner - CONFIG.ball.radius - 0.01, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    const startZ = ball.position.z;
    // Push forward (−Z) and into wall (+X)
    for (let i = 0; i < 120; i++) {
      ball.applyForce(
        new CANNON.Vec3(CONFIG.ball.moveForce * 0.5, 0, -CONFIG.ball.moveForce),
      );
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    // Ball should have moved forward or stayed, never backward
    expect(ball.position.z).toBeLessThanOrEqual(startZ + 0.5);
  });

  it("moving forward along left wall does not push ball backward", () => {
    // Wall on the left
    createWall(physics, -3, 1, 0, wallThickness, 2, 20);
    const wallInner = -3 + wallThickness / 2;
    ball.position.set(wallInner + CONFIG.ball.radius + 0.01, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    const startZ = ball.position.z;
    // Push forward (−Z) and into wall (−X)
    for (let i = 0; i < 120; i++) {
      ball.applyForce(
        new CANNON.Vec3(-CONFIG.ball.moveForce * 0.5, 0, -CONFIG.ball.moveForce),
      );
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThanOrEqual(startZ + 0.5);
  });

  it("moving right along front wall does not push ball left", () => {
    // Wall in front (along X axis at z = -3)
    const wall = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(20 / 2, 2 / 2, wallThickness / 2)),
      material: physics.wallMaterial,
    });
    wall.position.set(0, 1, -3);
    physics.addBody(wall);

    const wallInner = -3 + wallThickness / 2;
    ball.position.set(0, CONFIG.ball.radius, wallInner + CONFIG.ball.radius + 0.01);
    stepSeconds(physics, 0.2);

    const startX = ball.position.x;
    // Push right (+X) and into wall (−Z)
    for (let i = 0; i < 120; i++) {
      ball.applyForce(
        new CANNON.Vec3(CONFIG.ball.moveForce, 0, -CONFIG.ball.moveForce * 0.5),
      );
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    // Ball should have moved right or stayed, never left
    expect(ball.position.x).toBeGreaterThanOrEqual(startX - 0.5);
  });

  it("high-speed ball along wall maintains forward direction", () => {
    // Wall on the right
    createWall(physics, 3, 1, 0, wallThickness, 2, 20);
    const wallInner = 3 - wallThickness / 2;
    ball.position.set(wallInner - CONFIG.ball.radius - 0.01, CONFIG.ball.radius, 0);
    // Already moving forward fast
    ball.velocity.set(0, 0, -10);

    const startZ = ball.position.z;
    // Push into wall while moving forward
    for (let i = 0; i < 60; i++) {
      ball.applyForce(
        new CANNON.Vec3(CONFIG.ball.moveForce, 0, -CONFIG.ball.moveForce * 0.3),
      );
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    // Ball must still be ahead of where it started
    expect(ball.position.z).toBeLessThan(startZ);
  });
});

describe("Surface types — ice", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
  });

  it("ball slides further on ice than normal ground", () => {
    // Test on normal ground
    const physicsNormal = new Physics();
    const ballNormal = createBall(physicsNormal);
    createGround(physicsNormal);
    ballNormal.position.set(0, CONFIG.ball.radius, 0);
    ballNormal.velocity.set(0, 0, -10);
    stepSeconds(physicsNormal, 2);
    const normalDist = Math.abs(ballNormal.position.z);

    // Test on ice
    createIceGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
    ball.velocity.set(0, 0, -10);
    stepSeconds(physics, 2);
    const iceDist = Math.abs(ball.position.z);

    // Ball should slide further on ice
    expect(iceDist).toBeGreaterThan(normalDist);
  });
});

describe("Surface types — bounce", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
  });

  it("bounce material has higher restitution than ground", () => {
    // Drop ball on bounce pad
    createBounceGround(physics);
    ball.position.set(0, 3, 0);
    ball.velocity.set(0, 0, 0);

    // Step until ball hits and bounces
    let maxBounceY = 0;
    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      if (ball.velocity.y > 0 && ball.position.y > CONFIG.ball.radius + 0.1) {
        maxBounceY = Math.max(maxBounceY, ball.position.y);
      }
    }

    // Drop ball on normal ground
    const physicsNormal = new Physics();
    const ballNormal = createBall(physicsNormal);
    createGround(physicsNormal);
    ballNormal.position.set(0, 3, 0);
    ballNormal.velocity.set(0, 0, 0);

    let maxNormalY = 0;
    for (let i = 0; i < 300; i++) {
      physicsNormal.step(CONFIG.physics.fixedTimeStep);
      if (ballNormal.velocity.y > 0 && ballNormal.position.y > CONFIG.ball.radius + 0.1) {
        maxNormalY = Math.max(maxNormalY, ballNormal.position.y);
      }
    }

    // Bounce pad should send ball higher
    expect(maxBounceY).toBeGreaterThan(maxNormalY);
  });
});

describe("Elevated platform collision", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
  });

  it("ball moving upward is not deflected sideways by platform edge", () => {
    // Elevated platform at y=2, using actual height (no thickening)
    const platformH = 0.5;
    const platform = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(3, platformH / 2, 3)),
      material: physics.groundMaterial,
    });
    platform.position.set(0, 2, 0);
    physics.addBody(platform);

    // Ball below platform, moving upward (simulating bounce)
    ball.position.set(0, 0.5, 0);
    ball.velocity.set(0, 15, -2);

    const startX = ball.position.x;
    stepSeconds(physics, 0.5);

    // Ball should not be deflected far sideways
    expect(Math.abs(ball.position.x - startX)).toBeLessThan(1);
  });
});

describe("Max speed cap", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
  });

  it("ball speed is capped at maxSpeed", () => {
    // Apply force for a long time
    for (let i = 0; i < 600; i++) {
      ball.applyForce(new CANNON.Vec3(0, 0, -CONFIG.ball.moveForce));
      physics.step(CONFIG.physics.fixedTimeStep);

      // Cap like main.ts does
      const vel = ball.velocity;
      const speed = vel.length();
      if (speed > CONFIG.ball.maxSpeed) {
        vel.scale(CONFIG.ball.maxSpeed / speed, vel);
      }
    }

    expect(horizontalSpeed(ball)).toBeLessThanOrEqual(CONFIG.ball.maxSpeed + 0.1);
  });
});

describe("WASD movement — camera angle 0 (default)", () => {
  let physics: Physics;
  let ball: CANNON.Body;
  const angle = 0;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.1); // settle on ground
  });

  it("W moves ball forward (−Z)", () => {
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(-1);
    expect(Math.abs(ball.position.x)).toBeLessThan(0.5);
  });

  it("S moves ball backward (+Z)", () => {
    const keys = new Set(["KeyS"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeGreaterThan(1);
    expect(Math.abs(ball.position.x)).toBeLessThan(0.5);
  });

  it("A moves ball left (−X)", () => {
    const keys = new Set(["KeyA"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.x).toBeLessThan(-1);
    expect(Math.abs(ball.position.z)).toBeLessThan(0.5);
  });

  it("D moves ball right (+X)", () => {
    const keys = new Set(["KeyD"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.x).toBeGreaterThan(1);
    expect(Math.abs(ball.position.z)).toBeLessThan(0.5);
  });

  it("W+D moves ball diagonally forward-right", () => {
    const keys = new Set(["KeyW", "KeyD"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(-0.5);
    expect(ball.position.x).toBeGreaterThan(0.5);
  });

  it("W+A moves ball diagonally forward-left", () => {
    const keys = new Set(["KeyW", "KeyA"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(-0.5);
    expect(ball.position.x).toBeLessThan(-0.5);
  });

  it("no keys means no movement", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(Math.abs(ball.position.x)).toBeLessThan(0.1);
    expect(Math.abs(ball.position.z)).toBeLessThan(0.1);
  });
});

describe("WASD movement — rotated camera", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.1);
  });

  it("W with camera rotated 90° moves ball in −X instead of −Z", () => {
    const angle = Math.PI / 2;
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.x).toBeLessThan(-1);
    expect(Math.abs(ball.position.z)).toBeLessThan(0.5);
  });

  it("D with camera rotated 90° moves ball in −Z instead of +X", () => {
    const angle = Math.PI / 2;
    const keys = new Set(["KeyD"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(-1);
    expect(Math.abs(ball.position.x)).toBeLessThan(0.5);
  });

  it("W with camera rotated 180° moves ball in +Z", () => {
    const angle = Math.PI;
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 80; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeGreaterThan(1);
    expect(Math.abs(ball.position.x)).toBeLessThan(0.5);
  });
});

describe("WASD movement — wall interactions", () => {
  let physics: Physics;
  let ball: CANNON.Body;
  const wallThickness = 1.5;
  const angle = 0;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.1);
  });

  it("W along right wall moves ball forward, not backward", () => {
    createWall(physics, 3, 1, 0, wallThickness, 2, 40);
    const wallInner = 3 - wallThickness / 2;
    ball.position.set(wallInner - CONFIG.ball.radius - 0.01, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    const startZ = ball.position.z;
    const keys = new Set(["KeyW", "KeyD"]); // forward + into wall
    for (let i = 0; i < 120; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(startZ);
  });

  it("W along left wall moves ball forward, not backward", () => {
    createWall(physics, -3, 1, 0, wallThickness, 2, 40);
    const wallInner = -3 + wallThickness / 2;
    ball.position.set(wallInner + CONFIG.ball.radius + 0.01, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    const startZ = ball.position.z;
    const keys = new Set(["KeyW", "KeyA"]); // forward + into wall
    for (let i = 0; i < 120; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(startZ);
  });

  it("D along front wall moves ball right, not left", () => {
    const wall = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(20, 1, wallThickness / 2)),
      material: physics.wallMaterial,
    });
    wall.position.set(0, 1, -3);
    physics.addBody(wall);

    const wallInner = -3 + wallThickness / 2;
    ball.position.set(0, CONFIG.ball.radius, wallInner + CONFIG.ball.radius + 0.01);
    stepSeconds(physics, 0.2);

    const startX = ball.position.x;
    const keys = new Set(["KeyD", "KeyW"]); // right + into wall
    for (let i = 0; i < 120; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.x).toBeGreaterThan(startX);
  });

  it("ball speed does not spike when sliding along wall", () => {
    createWall(physics, 3, 1, 0, wallThickness, 2, 40);
    const wallInner = 3 - wallThickness / 2;
    ball.position.set(wallInner - CONFIG.ball.radius - 0.01, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    let maxHSpeed = 0;
    const keys = new Set(["KeyW", "KeyD"]);
    for (let i = 0; i < 120; i++) {
      applyMove(ball, keys, angle);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxHSpeed = Math.max(maxHSpeed, horizontalSpeed(ball));
    }
    expect(maxHSpeed).toBeLessThan(CONFIG.ball.maxSpeed * 1.5);
  });
});

describe("Box breaking", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  /**
   * Create a box obstacle matching what the Obstacle class produces:
   * kinematic sphere collider, wallMaterial.
   */
  function createBox(
    physics: Physics,
    x: number, y: number, z: number,
    size: number,
  ): CANNON.Body {
    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
      material: physics.wallMaterial,
    });
    body.position.set(x, y, z);
    physics.addBody(body);
    return body;
  }

  /**
   * Replicate the onBallCollide break logic from Level.ts:
   * returns whether the box would break at the given impact.
   */
  function wouldBreak(impactSpeed: number): boolean {
    return impactSpeed >= CONFIG.breakable.speedThreshold;
  }

  /**
   * Step one frame at a time, deferring body removals to between steps.
   * cannon-es crashes if you remove a body inside a collision callback.
   */
  function stepWithDeferredRemoval(
    physics: Physics,
    seconds: number,
    pendingRemovals: CANNON.Body[],
  ) {
    const steps = Math.round(seconds / CONFIG.physics.fixedTimeStep);
    for (let i = 0; i < steps; i++) {
      while (pendingRemovals.length > 0) {
        physics.removeBody(pendingRemovals.pop()!);
      }
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    while (pendingRemovals.length > 0) {
      physics.removeBody(pendingRemovals.pop()!);
    }
  }

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createGround(physics);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.1); // settle on ground
  });

  it("holding W long enough reaches break speed", () => {
    // Players should be able to break boxes by building up speed on flat ground
    const keys = new Set(["KeyW"]);
    let maxHSpeed = 0;
    for (let i = 0; i < 300; i++) { // 5 seconds
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxHSpeed = Math.max(maxHSpeed, horizontalSpeed(ball));
    }

    expect(maxHSpeed).toBeGreaterThanOrEqual(CONFIG.breakable.speedThreshold);
  });

  it("a brief tap does not reach break speed", () => {
    // A quick nudge shouldn't break boxes — you need to build up momentum
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 5; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(horizontalSpeed(ball)).toBeLessThan(CONFIG.breakable.speedThreshold);
  });

  it("speed boost increases top speed above normal WASD", () => {
    // Speed boost multiplier lets the ball go faster
    const speedMultiplier = CONFIG.powerUp.speedBoostMultiplier;
    const keys = new Set(["KeyW"]);
    let maxBoostedSpeed = 0;
    for (let i = 0; i < 300; i++) {
      applyMove(ball, keys, 0, speedMultiplier);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxBoostedSpeed = Math.max(maxBoostedSpeed, horizontalSpeed(ball));
    }

    // Measure normal speed for comparison
    const physics2 = new Physics();
    const ball2 = createBall(physics2);
    createGround(physics2);
    ball2.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics2, 0.1);
    let maxNormalSpeed = 0;
    for (let i = 0; i < 300; i++) {
      applyMove(ball2, keys, 0, 1);
      physics2.step(CONFIG.physics.fixedTimeStep);
      maxNormalSpeed = Math.max(maxNormalSpeed, horizontalSpeed(ball2));
    }

    expect(maxBoostedSpeed).toBeGreaterThan(maxNormalSpeed);
  });

  it("ball at full WASD speed exceeds break threshold", () => {
    // The ball must be able to reach break speed by just holding a direction
    const keys = new Set(["KeyW"]);
    let maxHSpeed = 0;
    for (let i = 0; i < 300; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxHSpeed = Math.max(maxHSpeed, horizontalSpeed(ball));
    }
    expect(wouldBreak(maxHSpeed)).toBe(true);
  });

  it("slow nudge does not exceed break threshold", () => {
    // A brief tap doesn't build enough speed to break boxes
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 10; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(wouldBreak(horizontalSpeed(ball))).toBe(false);
  });

  it("box blocks a slow ball", () => {
    // Create a wall-like obstacle in front of the ball
    createWall(physics, 0, 1, -3, 2, 2, 2);

    ball.velocity.set(0, 0, -3);
    stepSeconds(physics, 2);

    // Ball should be stopped
    expect(ball.position.z).toBeGreaterThan(-3);
  });

  it("removing a box lets the ball pass through", () => {
    // Create obstacle, then remove it — ball should pass through
    const wall = createWall(physics, 0, 1, -3, 2, 2, 2);

    // Verify it blocks first
    ball.velocity.set(0, 0, -5);
    stepSeconds(physics, 1);
    expect(ball.position.z).toBeGreaterThan(-3);

    // Remove and retry
    physics.removeBody(wall);
    ball.position.set(0, CONFIG.ball.radius, 0);
    ball.velocity.set(0, 0, -5);
    stepSeconds(physics, 1.5);

    // Ball passes through
    expect(ball.position.z).toBeLessThan(-3);
  });

  it("re-added box blocks the ball again", () => {
    const wall = createWall(physics, 0, 1, -3, 2, 2, 2);

    // Remove
    physics.removeBody(wall);

    // Re-add (simulates restoreBoxes)
    wall.position.set(0, 1, -3);
    physics.addBody(wall);

    ball.velocity.set(0, 0, -3);
    stepSeconds(physics, 2);

    // Ball should be stopped again
    expect(ball.position.z).toBeGreaterThan(-3);
  });
});
