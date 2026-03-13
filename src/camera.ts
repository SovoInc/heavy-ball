import * as THREE from "three";
import { CONFIG } from "./config";
import type { Ball } from "./objects/Ball";

export class GameCamera {
  private target = new THREE.Vector3();
  private currentPos = new THREE.Vector3();
  private angle = 0;

  constructor(private camera: THREE.PerspectiveCamera) {}

  getAngle(): number {
    return this.angle;
  }

  update(ball: Ball) {
    const { offset, lerpSpeed } = CONFIG.camera;

    const ballPos = new THREE.Vector3(
      ball.position.x,
      ball.position.y,
      ball.position.z,
    );

    this.target.lerp(ballPos, lerpSpeed * 2);

    const desiredPos = new THREE.Vector3(
      ballPos.x + offset.x,
      ballPos.y + offset.y,
      ballPos.z + offset.z,
    );

    this.currentPos.lerp(desiredPos, lerpSpeed);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.target);

    this.angle = Math.atan2(
      this.camera.position.x - ballPos.x,
      this.camera.position.z - ballPos.z,
    );
  }

  snapTo(ball: Ball) {
    const { offset } = CONFIG.camera;
    const ballPos = new THREE.Vector3(
      ball.position.x,
      ball.position.y,
      ball.position.z,
    );
    this.currentPos.set(
      ballPos.x + offset.x,
      ballPos.y + offset.y,
      ballPos.z + offset.z,
    );
    this.target.copy(ballPos);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.target);
  }
}
