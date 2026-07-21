import * as CANNON from "cannon-es";
import { CONFIG } from "./config";

export class Physics {
  world: CANNON.World;
  groundMaterial: CANNON.Material;
  ballMaterial: CANNON.Material;
  wallMaterial: CANNON.Material;
  iceMaterial: CANNON.Material;
  bounceMaterial: CANNON.Material;
  private ballContacts: Array<{ contact: CANNON.ContactMaterial; baseFriction: number; baseRestitution: number }> = [];

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
    this.iceMaterial = new CANNON.Material("ice");
    this.bounceMaterial = new CANNON.Material("bounce");

    const groundContact = new CANNON.ContactMaterial(this.ballMaterial, this.groundMaterial, {
        friction: CONFIG.physics.groundFriction,
        restitution: CONFIG.physics.groundRestitution,
      });
    this.world.addContactMaterial(groundContact);

    const wallContact = new CANNON.ContactMaterial(this.ballMaterial, this.wallMaterial, {
        friction: CONFIG.physics.wallFriction,
        restitution: CONFIG.physics.wallRestitution,
      });
    this.world.addContactMaterial(wallContact);

    const iceContact = new CANNON.ContactMaterial(this.ballMaterial, this.iceMaterial, {
        friction: CONFIG.physics.iceFriction,
        restitution: CONFIG.physics.iceRestitution,
      });
    this.world.addContactMaterial(iceContact);

    const bounceContact = new CANNON.ContactMaterial(this.ballMaterial, this.bounceMaterial, {
        friction: CONFIG.physics.bounceFriction,
        restitution: CONFIG.physics.bounceRestitution,
      });
    this.world.addContactMaterial(bounceContact);
    this.ballContacts = [
      { contact: groundContact, baseFriction: CONFIG.physics.groundFriction, baseRestitution: CONFIG.physics.groundRestitution },
      { contact: wallContact, baseFriction: CONFIG.physics.wallFriction, baseRestitution: CONFIG.physics.wallRestitution },
      { contact: iceContact, baseFriction: CONFIG.physics.iceFriction, baseRestitution: CONFIG.physics.iceRestitution },
      { contact: bounceContact, baseFriction: CONFIG.physics.bounceFriction, baseRestitution: CONFIG.physics.bounceRestitution },
    ];
  }

  setBallHandling(gripMultiplier: number, restitutionMultiplier: number) {
    for (const { contact, baseFriction, baseRestitution } of this.ballContacts) {
      contact.friction = Math.min(1, baseFriction * gripMultiplier);
      contact.restitution = Math.min(1.35, baseRestitution * restitutionMultiplier);
    }
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
