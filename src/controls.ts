import * as CANNON from "cannon-es";
import { CONFIG } from "./config";
import type { Ball } from "./objects/Ball";

export class Controls {
  private keys = new Set<string>();
  private enabled = true;

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private gameKeys = new Set([
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "KeyR",
  ]);

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.gameKeys.has(e.code)) {
      e.preventDefault();
    }
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) this.keys.clear();
  }

  update(ball: Ball, cameraAngle: number) {
    if (!this.enabled) return;

    const force = new CANNON.Vec3(0, 0, 0);
    const { moveForce } = CONFIG.ball;

    const sinA = Math.sin(cameraAngle);
    const cosA = Math.cos(cameraAngle);

    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) {
      force.x += -sinA * moveForce;
      force.z += -cosA * moveForce;
    }
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) {
      force.x += sinA * moveForce;
      force.z += cosA * moveForce;
    }
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) {
      force.x += -cosA * moveForce;
      force.z += sinA * moveForce;
    }
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) {
      force.x += cosA * moveForce;
      force.z += -sinA * moveForce;
    }

    if (force.length() > 0) {
      const speed = ball.speed;
      const speedRatio = Math.max(0, 1 - speed / CONFIG.ball.maxSpeed);
      force.scale(speedRatio, force);
      ball.body.wakeUp();
      ball.body.applyForce(force, ball.body.position);
    }
  }

  isRestartPressed(): boolean {
    return this.keys.has("KeyR");
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
