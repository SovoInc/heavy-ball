import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  constructor(scene: THREE.Scene, physics: Physics) {
    const { radius, mass, linearDamping, angularDamping } = CONFIG.ball;

    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.ball,
      metalness: 0.7,
      roughness: 0.25,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass,
      shape: new CANNON.Sphere(radius),
      material: physics.ballMaterial,
      linearDamping,
      angularDamping,
    });
    physics.addBody(this.body);
  }

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z);
    this.body.velocity.setZero();
    this.body.angularVelocity.setZero();
    this.syncMesh();
  }

  syncMesh() {
    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion,
    );
  }

  get position(): CANNON.Vec3 {
    return this.body.position;
  }

  get speed(): number {
    return this.body.velocity.length();
  }
}
