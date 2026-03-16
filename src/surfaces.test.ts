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

function createPlatform(
  physics: Physics,
  material: CANNON.Material,
  x = 0, y = 0, z = 0,
  w = 6, h = 0.5, d = 20,
): CANNON.Body {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)),
    material,
  });
  body.position.set(x, y - h / 2, z);
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

function applyMove(ball: CANNON.Body, keys: Set<string>, cameraAngle: number, speedMultiplier = 1) {
  const force = new CANNON.Vec3(0, 0, 0);
  const { moveForce } = CONFIG.ball;
  const sinA = Math.sin(cameraAngle);
  const cosA = Math.cos(cameraAngle);

  if (keys.has("KeyW")) { force.x += -sinA * moveForce; force.z += -cosA * moveForce; }
  if (keys.has("KeyS")) { force.x += sinA * moveForce; force.z += cosA * moveForce; }
  if (keys.has("KeyA")) { force.x += -cosA * moveForce; force.z += sinA * moveForce; }
  if (keys.has("KeyD")) { force.x += cosA * moveForce; force.z += -sinA * moveForce; }

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
// Normal surface — ball can roll across and stop
// ---------------------------------------------------------------------------

describe("Normal surface crossability", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 40);
    ball.position.set(0, CONFIG.ball.radius, 15);
    stepSeconds(physics, 0.2);
  });

  it("ball can roll across the platform with WASD", () => {
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    // Ball should have moved significantly forward (−Z)
    expect(ball.position.z).toBeLessThan(5);
  });

  it("ball reaches usable speed on normal ground", () => {
    const keys = new Set(["KeyW"]);
    let maxSpeed = 0;
    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxSpeed = Math.max(maxSpeed, horizontalSpeed(ball));
    }
    expect(maxSpeed).toBeGreaterThan(3);
  });

  it("ball stays on the platform while rolling", () => {
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 300; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    // Ball should still be near ground level, not fallen off
    expect(ball.position.y).toBeGreaterThan(-1);
  });
});

// ---------------------------------------------------------------------------
// Ice surface — ball slides but can still traverse
// ---------------------------------------------------------------------------

describe("Ice surface crossability", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createPlatform(physics, physics.iceMaterial, 0, 0, 0, 6, 0.5, 40);
    ball.position.set(0, CONFIG.ball.radius, 15);
    stepSeconds(physics, 0.2);
  });

  it("ball can cross ice platform with WASD", () => {
    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    expect(ball.position.z).toBeLessThan(5);
  });

  it("ball slides further on ice after releasing input", () => {
    // Give ball a direct velocity push (bypasses damping-dominated acceleration)
    ball.velocity.set(0, 0, -8);

    // Coast with no input for a while
    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
    }
    const iceEndZ = ball.position.z;

    // Compare to normal ground
    const physics2 = new Physics();
    const ball2 = createBall(physics2);
    createPlatform(physics2, physics2.groundMaterial, 0, 0, 0, 6, 0.5, 40);
    ball2.position.set(0, CONFIG.ball.radius, 15);
    stepSeconds(physics2, 0.2);
    ball2.velocity.set(0, 0, -8);

    for (let i = 0; i < 300; i++) {
      physics2.step(CONFIG.physics.fixedTimeStep);
    }
    const normalEndZ = ball2.position.z;

    // Ice ball should have traveled further (lower Z)
    expect(iceEndZ).toBeLessThan(normalEndZ);
  });

  it("ball can still change direction on ice", () => {
    // Move forward
    const forward = new Set(["KeyW"]);
    for (let i = 0; i < 120; i++) {
      applyMove(ball, forward, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Now try to move right
    const right = new Set(["KeyD"]);
    for (let i = 0; i < 240; i++) {
      applyMove(ball, right, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Ball should have moved right (positive X)
    expect(ball.position.x).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Bounce surface — ball bounces upward and can land on higher platforms
// ---------------------------------------------------------------------------

describe("Bounce surface crossability", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
  });

  it("ball bounces higher off bounce material than normal ground", () => {
    // Drop on bounce pad
    createPlatform(physics, physics.bounceMaterial, 0, 0, 0, 6, 0.5, 6);
    ball.position.set(0, 3, 0);
    ball.velocity.set(0, 0, 0);

    let maxBounceY = 0;
    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      if (ball.velocity.y > 0 && ball.position.y > CONFIG.ball.radius + 0.1) {
        maxBounceY = Math.max(maxBounceY, ball.position.y);
      }
    }

    // Drop on normal ground
    const physics2 = new Physics();
    const ball2 = createBall(physics2);
    createPlatform(physics2, physics2.groundMaterial, 0, 0, 0, 6, 0.5, 6);
    ball2.position.set(0, 3, 0);

    let maxNormalY = 0;
    for (let i = 0; i < 300; i++) {
      physics2.step(CONFIG.physics.fixedTimeStep);
      if (ball2.velocity.y > 0 && ball2.position.y > CONFIG.ball.radius + 0.1) {
        maxNormalY = Math.max(maxNormalY, ball2.position.y);
      }
    }

    expect(maxBounceY).toBeGreaterThan(maxNormalY);
  });

  it("bounce impulse launches ball to expected height", () => {
    // Level.ts applies bounce impulse by setting vel.y = CONFIG.surfaces.bounce.impulse
    // Simulate that behavior
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 6);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    // Apply bounce impulse like Level.ts does
    ball.velocity.y = CONFIG.surfaces.bounce.impulse;

    let maxHeight = 0;
    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      maxHeight = Math.max(maxHeight, ball.position.y);
    }

    // Expected max height: v^2 / (2g) = 18^2 / (2*20) = 8.1
    const expectedHeight = (CONFIG.surfaces.bounce.impulse ** 2) / (2 * Math.abs(CONFIG.physics.gravity));
    expect(maxHeight).toBeGreaterThan(expectedHeight * 0.7);
  });

  it("bounced ball covers significant horizontal distance while airborne", () => {
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 6);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    // Apply bounce impulse and forward velocity
    ball.velocity.y = CONFIG.surfaces.bounce.impulse;
    ball.velocity.z = -CONFIG.ball.maxSpeed * 0.8;

    // Track position until ball comes back down
    let maxHorizontalDist = 0;
    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      maxHorizontalDist = Math.max(maxHorizontalDist, Math.abs(ball.position.z));
    }

    // Bounce air time ~1.8s, at maxSpeed*0.8 ~11.2 = ~20 units horizontal
    expect(maxHorizontalDist).toBeGreaterThan(10);
  });

  it("bounce pad launches ball high enough to clear obstacles", () => {
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 6);
    ball.position.set(0, CONFIG.ball.radius, 0);
    stepSeconds(physics, 0.2);

    ball.velocity.y = CONFIG.surfaces.bounce.impulse;

    let maxHeight = 0;
    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      maxHeight = Math.max(maxHeight, ball.position.y);
    }

    // Should reach at least 5 units (typical obstacle/wall height)
    expect(maxHeight).toBeGreaterThan(5);
  });
});

// ---------------------------------------------------------------------------
// Speed/Conveyor surface — ball is pushed in a direction but can fight it
// ---------------------------------------------------------------------------

describe("Speed (conveyor) surface crossability", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 30);
    ball.position.set(0, CONFIG.ball.radius, 10);
    stepSeconds(physics, 0.2);
  });

  it("conveyor force pushes a stationary ball", () => {
    const startZ = ball.position.z;
    const conveyorDir = new CANNON.Vec3(0, 0, -1);
    const force = CONFIG.surfaces.speed.force;

    for (let i = 0; i < 180; i++) {
      ball.applyForce(new CANNON.Vec3(
        conveyorDir.x * force,
        conveyorDir.y * force,
        conveyorDir.z * force,
      ));
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Ball should have moved in conveyor direction
    expect(ball.position.z).toBeLessThan(startZ - 1);
  });

  it("ball can move against conveyor with WASD", () => {
    const conveyorDir = new CANNON.Vec3(0, 0, -1);
    const force = CONFIG.surfaces.speed.force;
    const keys = new Set(["KeyS"]); // push backward (+Z), against conveyor

    for (let i = 0; i < 300; i++) {
      ball.applyForce(new CANNON.Vec3(
        conveyorDir.x * force,
        conveyorDir.y * force,
        conveyorDir.z * force,
      ));
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Ball should not have been swept far — player can fight the conveyor
    // moveForce (35) > conveyor force (7), so player should win
    expect(ball.position.z).toBeGreaterThan(5);
  });

  it("ball moving with conveyor goes faster than normal", () => {
    const conveyorDir = new CANNON.Vec3(0, 0, -1);
    const force = CONFIG.surfaces.speed.force;
    const keys = new Set(["KeyW"]);

    let maxSpeedWithConveyor = 0;
    for (let i = 0; i < 300; i++) {
      ball.applyForce(new CANNON.Vec3(
        conveyorDir.x * force,
        conveyorDir.y * force,
        conveyorDir.z * force,
      ));
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxSpeedWithConveyor = Math.max(maxSpeedWithConveyor, horizontalSpeed(ball));
    }

    // Compare to normal movement
    const physics2 = new Physics();
    const ball2 = createBall(physics2);
    createPlatform(physics2, physics2.groundMaterial, 0, 0, 0, 6, 0.5, 30);
    ball2.position.set(0, CONFIG.ball.radius, 10);
    stepSeconds(physics2, 0.2);

    let maxSpeedNormal = 0;
    for (let i = 0; i < 300; i++) {
      applyMove(ball2, keys, 0);
      physics2.step(CONFIG.physics.fixedTimeStep);
      maxSpeedNormal = Math.max(maxSpeedNormal, horizontalSpeed(ball2));
    }

    // With conveyor assist, should reach higher peak speed
    expect(maxSpeedWithConveyor).toBeGreaterThan(maxSpeedNormal);
  });

  it("conveyor force is not so strong that ball cannot be controlled", () => {
    const conveyorDir = new CANNON.Vec3(1, 0, 0); // push right
    const force = CONFIG.surfaces.speed.force;
    const keys = new Set(["KeyA"]); // push left, fighting conveyor

    for (let i = 0; i < 600; i++) {
      ball.applyForce(new CANNON.Vec3(
        conveyorDir.x * force,
        conveyorDir.y * force,
        conveyorDir.z * force,
      ));
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Player's moveForce (35) > conveyor (7), so ball should move left
    expect(ball.position.x).toBeLessThan(0);
  });

  it("ball on conveyor hitting a wall is not violently ejected", () => {
    // This tests that conveyor force applied at center of mass does not
    // generate torque that combines with wall collision to launch the ball.
    const wallThickness = 1.5;
    const wall = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(20 / 2, 2 / 2, wallThickness / 2)),
      material: physics.wallMaterial,
    });
    wall.position.set(0, 1, -5);
    physics.addBody(wall);

    // Push ball into wall with conveyor force
    const conveyorDir = new CANNON.Vec3(0, 0, -1);
    const force = CONFIG.surfaces.speed.force;
    const keys = new Set(["KeyW"]);

    let maxSpeed = 0;
    for (let i = 0; i < 300; i++) {
      ball.applyForce(new CANNON.Vec3(
        conveyorDir.x * force,
        conveyorDir.y * force,
        conveyorDir.z * force,
      ));
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      maxSpeed = Math.max(maxSpeed, horizontalSpeed(ball));
    }

    // Ball should not have been launched at extreme speed
    expect(maxSpeed).toBeLessThan(CONFIG.ball.maxSpeed * 1.5);
    // Ball should still be on the platform (not ejected upward or sideways)
    expect(ball.position.y).toBeLessThan(3);
    expect(Math.abs(ball.position.x)).toBeLessThan(5);
  });

  it("ball on sideways conveyor hitting side wall is not launched", () => {
    // Side wall at x=3
    const wallThickness = 1.5;
    const wall = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(wallThickness / 2, 2 / 2, 15)),
      material: physics.wallMaterial,
    });
    wall.position.set(3, 1, 0);
    physics.addBody(wall);

    // Conveyor pushes right into wall
    const conveyorDir = new CANNON.Vec3(1, 0, 0);
    const force = CONFIG.surfaces.speed.force;

    let maxSpeed = 0;
    for (let i = 0; i < 300; i++) {
      ball.applyForce(new CANNON.Vec3(
        conveyorDir.x * force,
        conveyorDir.y * force,
        conveyorDir.z * force,
      ));
      physics.step(CONFIG.physics.fixedTimeStep);
      maxSpeed = Math.max(maxSpeed, horizontalSpeed(ball));
    }

    // Ball should not be violently ejected
    expect(maxSpeed).toBeLessThan(CONFIG.ball.maxSpeed * 1.5);
    expect(ball.position.y).toBeLessThan(3);
  });
});

// ---------------------------------------------------------------------------
// Lava surface — ball can cross if fast enough (before damage timer)
// ---------------------------------------------------------------------------

describe("Lava surface crossability", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    // Lava uses groundMaterial for physics. Use a realistic lava segment size.
    // Actual levels use lava segments of ~6-8 units long
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 8);
    ball.position.set(0, CONFIG.ball.radius, 4);
    stepSeconds(physics, 0.2);
  });

  it("ball with running start can cross lava before damage timer", () => {
    // Give ball initial speed (entering lava from normal platform)
    ball.velocity.set(0, 0, -CONFIG.ball.maxSpeed * 0.7);
    const keys = new Set(["KeyW"]);
    let timeElapsed = 0;

    for (let i = 0; i < 300; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      timeElapsed += CONFIG.physics.fixedTimeStep;

      // Check if ball has crossed the platform (passed z = -4)
      if (ball.position.z < -4) break;
    }

    expect(timeElapsed).toBeLessThan(CONFIG.surfaces.lava.damageTime);
  });

  it("ball at half max speed can theoretically cross within lava damage time", () => {
    const crossingSpeed = CONFIG.ball.maxSpeed * 0.5;
    // Max lava length crossable: speed * damageTime
    const maxCrossableLength = crossingSpeed * CONFIG.surfaces.lava.damageTime;
    // Lava segments in levels should be shorter than this
    expect(maxCrossableLength).toBeGreaterThan(8);
  });

  it("ball rolling at full speed crosses lava quickly", () => {
    ball.velocity.set(0, 0, -CONFIG.ball.maxSpeed);
    let timeOnPlatform = 0;

    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      timeOnPlatform += CONFIG.physics.fixedTimeStep;

      if (ball.position.z < -4) break;
    }

    // At max speed (14), 8 units takes ~0.57s, well within 1.5s damage time
    expect(timeOnPlatform).toBeLessThan(CONFIG.surfaces.lava.damageTime);
  });
});

// ---------------------------------------------------------------------------
// Crumbling surface — ball can cross before platform disappears
// ---------------------------------------------------------------------------

describe("Crumbling surface crossability", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
    // Crumbling uses groundMaterial. Realistic crumbling segment: ~8 units
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 8);
    ball.position.set(0, CONFIG.ball.radius, 4);
    stepSeconds(physics, 0.2);
  });

  it("ball with running start can cross before crumble delay", () => {
    ball.velocity.set(0, 0, -CONFIG.ball.maxSpeed * 0.6);
    const keys = new Set(["KeyW"]);
    let timeElapsed = 0;

    for (let i = 0; i < 300; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
      timeElapsed += CONFIG.physics.fixedTimeStep;

      if (ball.position.z < -4) break;
    }

    expect(timeElapsed).toBeLessThan(CONFIG.surfaces.crumbling.delay);
  });

  it("ball at half max speed can theoretically cross within crumble delay", () => {
    const crossingSpeed = CONFIG.ball.maxSpeed * 0.5;
    const maxCrossableLength = crossingSpeed * CONFIG.surfaces.crumbling.delay;
    // Crumbling segments should be shorter than this
    expect(maxCrossableLength).toBeGreaterThan(8);
  });

  it("ball at max speed crosses crumbling platform well within delay", () => {
    ball.velocity.set(0, 0, -CONFIG.ball.maxSpeed);
    let timeOnPlatform = 0;

    for (let i = 0; i < 300; i++) {
      physics.step(CONFIG.physics.fixedTimeStep);
      timeOnPlatform += CONFIG.physics.fixedTimeStep;

      if (ball.position.z < -4) break;
    }

    expect(timeOnPlatform).toBeLessThan(CONFIG.surfaces.crumbling.delay);
  });
});

// ---------------------------------------------------------------------------
// Cross-surface transitions — ball can move between different surface types
// ---------------------------------------------------------------------------

describe("Surface transitions", () => {
  let physics: Physics;
  let ball: CANNON.Body;

  beforeEach(() => {
    physics = new Physics();
    ball = createBall(physics);
  });

  it("ball can roll from normal ground onto ice", () => {
    // Adjacent platforms: normal then ice
    createPlatform(physics, physics.groundMaterial, 0, 0, 8, 6, 0.5, 16);
    createPlatform(physics, physics.iceMaterial, 0, 0, -8, 6, 0.5, 16);
    ball.position.set(0, CONFIG.ball.radius, 14);
    stepSeconds(physics, 0.2);

    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Should have crossed onto the ice platform
    expect(ball.position.z).toBeLessThan(-2);
  });

  it("ball can roll from ice back onto normal ground", () => {
    createPlatform(physics, physics.iceMaterial, 0, 0, 8, 6, 0.5, 16);
    createPlatform(physics, physics.groundMaterial, 0, 0, -8, 6, 0.5, 16);
    ball.position.set(0, CONFIG.ball.radius, 14);
    stepSeconds(physics, 0.2);

    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    expect(ball.position.z).toBeLessThan(-2);
  });

  it("ball can roll from normal ground onto bounce pad and launch", () => {
    createPlatform(physics, physics.groundMaterial, 0, 0, 5, 6, 0.5, 10);
    createPlatform(physics, physics.bounceMaterial, 0, 0, -2, 6, 0.5, 4);
    ball.position.set(0, CONFIG.ball.radius, 9);
    stepSeconds(physics, 0.2);

    const keys = new Set(["KeyW"]);
    let maxHeight = 0;
    let hitBouncePad = false;
    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);

      // Simulate the Level.ts bounce impulse when ball reaches bounce pad area
      if (!hitBouncePad && ball.position.z < 0 && ball.position.y < CONFIG.ball.radius + 0.3) {
        ball.velocity.y = CONFIG.surfaces.bounce.impulse;
        hitBouncePad = true;
      }

      maxHeight = Math.max(maxHeight, ball.position.y);
    }

    // Ball should have bounced up from the pad
    expect(maxHeight).toBeGreaterThan(3);
  });

  it("ball maintains momentum crossing from normal to conveyor-assist surface", () => {
    createPlatform(physics, physics.groundMaterial, 0, 0, 0, 6, 0.5, 40);
    ball.position.set(0, CONFIG.ball.radius, 15);
    stepSeconds(physics, 0.2);

    const keys = new Set(["KeyW"]);
    const conveyorForce = CONFIG.surfaces.speed.force;

    for (let i = 0; i < 600; i++) {
      applyMove(ball, keys, 0);
      // Simulate conveyor on second half of platform
      if (ball.position.z < 0) {
        ball.applyForce(new CANNON.Vec3(0, 0, -conveyorForce));
      }
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Ball should have covered significant distance
    expect(ball.position.z).toBeLessThan(-5);
  });

  it("ball can cross a sequence of different surfaces", () => {
    // Normal → Ice → Normal — a common level pattern
    createPlatform(physics, physics.groundMaterial, 0, 0, 14, 6, 0.5, 12);
    createPlatform(physics, physics.iceMaterial, 0, 0, 2, 6, 0.5, 12);
    createPlatform(physics, physics.groundMaterial, 0, 0, -10, 6, 0.5, 12);
    ball.position.set(0, CONFIG.ball.radius, 18);
    stepSeconds(physics, 0.2);

    const keys = new Set(["KeyW"]);
    for (let i = 0; i < 900; i++) {
      applyMove(ball, keys, 0);
      physics.step(CONFIG.physics.fixedTimeStep);
    }

    // Should traverse all three platforms
    expect(ball.position.z).toBeLessThan(-5);
  });
});
