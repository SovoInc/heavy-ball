import * as CANNON from "cannon-es";
import { CONFIG } from "./config";
import type { Ball } from "./objects/Ball";

export class Controls {
  private keys = new Set<string>();
  private enabled = true;
  speedMultiplier = 1;

  // Virtual joystick state
  private joystickEl: HTMLElement | null = null;
  private knobEl: HTMLElement | null = null;
  private joystickInput = { x: 0, y: 0 };
  private activeTouch: number | null = null;
  private joystickOrigin = { x: 0, y: 0 };
  private readonly joystickRadius = 50;
  private isTouchDevice = false;

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    // Show joystick on first touch
    window.addEventListener("touchstart", this.onFirstTouch, { once: true });
  }

  private onFirstTouch = () => {
    this.isTouchDevice = true;
    this.createJoystick();
  };

  private createJoystick() {
    // Outer ring
    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      border: 2px solid rgba(255,255,255,0.2);
      touch-action: none;
      z-index: 1000;
      pointer-events: auto;
    `;

    // Inner knob
    const knob = document.createElement("div");
    knob.style.cssText = `
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      border: 2px solid rgba(255,255,255,0.4);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    el.appendChild(knob);
    document.body.appendChild(el);

    this.joystickEl = el;
    this.knobEl = knob;

    el.addEventListener("touchstart", this.onJoystickTouchStart, { passive: false });
    window.addEventListener("touchmove", this.onJoystickTouchMove, { passive: false });
    window.addEventListener("touchend", this.onJoystickTouchEnd);
    window.addEventListener("touchcancel", this.onJoystickTouchEnd);
  }

  private onJoystickTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (this.activeTouch !== null) return;
    const touch = e.changedTouches[0];
    this.activeTouch = touch.identifier;
    const rect = this.joystickEl!.getBoundingClientRect();
    this.joystickOrigin.x = rect.left + rect.width / 2;
    this.joystickOrigin.y = rect.top + rect.height / 2;
    this.updateJoystickFromTouch(touch);
  };

  private onJoystickTouchMove = (e: TouchEvent) => {
    if (this.activeTouch === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouch) {
        e.preventDefault();
        this.updateJoystickFromTouch(touch);
        return;
      }
    }
  };

  private onJoystickTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.activeTouch) {
        this.activeTouch = null;
        this.joystickInput.x = 0;
        this.joystickInput.y = 0;
        if (this.knobEl) {
          this.knobEl.style.transform = "translate(-50%, -50%)";
        }
        return;
      }
    }
  };

  private updateJoystickFromTouch(touch: Touch) {
    const dx = touch.clientX - this.joystickOrigin.x;
    const dy = touch.clientY - this.joystickOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, this.joystickRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * clamped;
    const clampedY = Math.sin(angle) * clamped;

    // Normalize to -1..1
    this.joystickInput.x = clampedX / this.joystickRadius;
    this.joystickInput.y = clampedY / this.joystickRadius;

    if (this.knobEl) {
      this.knobEl.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    }
  }

  private gameKeys = new Set([
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  ]);

  private onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === "INPUT") return;
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
    if (!v) {
      this.keys.clear();
      this.joystickInput.x = 0;
      this.joystickInput.y = 0;
    }
  }

  update(ball: Ball, cameraAngle: number) {
    if (!this.enabled) return;

    const force = new CANNON.Vec3(0, 0, 0);
    const { moveForce } = CONFIG.ball;

    const sinA = Math.sin(cameraAngle);
    const cosA = Math.cos(cameraAngle);

    // Keyboard input
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

    // Virtual joystick input (joystick x = left/right, y = up/down on screen)
    // Screen up (negative y) = forward, screen right (positive x) = right
    if (Math.abs(this.joystickInput.x) > 0.1 || Math.abs(this.joystickInput.y) > 0.1) {
      const jx = this.joystickInput.x;
      const jy = this.joystickInput.y;
      // Forward/back (screen Y maps to forward/back)
      force.x += jy * sinA * moveForce;
      force.z += jy * cosA * moveForce;
      // Left/right (screen X maps to strafe)
      force.x += jx * cosA * moveForce;
      force.z += jx * -sinA * moveForce;
    }

    if (force.length() > 0) {
      const speed = ball.speed;
      const maxSpeed = CONFIG.ball.maxSpeed * this.speedMultiplier;
      const speedRatio = Math.max(0, 1 - speed / maxSpeed);
      force.scale(speedRatio * this.speedMultiplier, force);
      ball.body.wakeUp();
      ball.body.applyForce(force);
    }
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    if (this.joystickEl) {
      this.joystickEl.remove();
    }
  }
}
