import * as THREE from "three";
import { CONFIG } from "./config";
import type { Ball } from "./objects/Ball";

export class GameCamera {
  private target = new THREE.Vector3();
  private currentPos = new THREE.Vector3();
  private angle = 0;
  private currentFov = 55;
  private currentRoll = 0;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(private camera: THREE.PerspectiveCamera) {}

  getAngle(): number {
    return this.angle;
  }

  update(ball: Ball, speedIntensity = 0, dt = 1 / 60) {
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

    const motionScale = this.reducedMotion ? 0.25 : 1;
    const targetFov = 55 + speedIntensity * 7 * motionScale;
    this.currentFov = THREE.MathUtils.lerp(this.currentFov, targetFov, Math.min(1, dt * 5));
    if (Math.abs(this.camera.fov - this.currentFov) > 0.01) {
      this.camera.fov = this.currentFov;
      this.camera.updateProjectionMatrix();
    }

    const velocity = ball.body.velocity;
    const lateral = velocity.x * Math.cos(this.angle) - velocity.z * Math.sin(this.angle);
    const targetRoll = THREE.MathUtils.clamp(-lateral * 0.0045, -0.045, 0.045)
      * speedIntensity * motionScale;
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRoll, Math.min(1, dt * 7));
    this.camera.rotateZ(this.currentRoll);

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
    this.currentFov = 55;
    this.currentRoll = 0;
    this.camera.fov = 55;
    this.camera.updateProjectionMatrix();
  }
}
