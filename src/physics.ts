import * as CANNON from "cannon-es";
import { CONFIG } from "./config";

export class Physics {
  world: CANNON.World;
  groundMaterial: CANNON.Material;
  ballMaterial: CANNON.Material;
  wallMaterial: CANNON.Material;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, CONFIG.physics.gravity, 0),
    });
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.allowSleep = false;
    (this.world.solver as CANNON.GSSolver).iterations = 10;

    this.groundMaterial = new CANNON.Material("ground");
    this.ballMaterial = new CANNON.Material("ball");
    this.wallMaterial = new CANNON.Material("wall");

    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.ballMaterial, this.groundMaterial, {
        friction: CONFIG.physics.groundFriction,
        restitution: CONFIG.physics.groundRestitution,
      }),
    );

    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.ballMaterial, this.wallMaterial, {
        friction: CONFIG.physics.wallFriction,
        restitution: CONFIG.physics.wallRestitution,
      }),
    );
  }

  step(dt: number) {
    this.world.step(CONFIG.physics.fixedTimeStep, dt, CONFIG.physics.maxSubSteps);
  }

  removeBody(body: CANNON.Body) {
    this.world.removeBody(body);
  }

  addBody(body: CANNON.Body) {
    this.world.addBody(body);
  }

  reset() {
    const bodies = [...this.world.bodies];
    for (const b of bodies) {
      this.world.removeBody(b);
    }
  }
}
