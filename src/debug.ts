import * as THREE from "three";
import * as CANNON from "cannon-es";
import type { Physics } from "./physics";
import type { Ball } from "./objects/Ball";

export class DebugRenderer {
  private enabled = false;
  private wireframes: Map<number, THREE.LineSegments> = new Map();
  private panel: HTMLDivElement;
  private scene: THREE.Scene;
  private physics: Physics;

  constructor(scene: THREE.Scene, physics: Physics) {
    this.scene = scene;
    this.physics = physics;

    this.panel = document.createElement("div");
    this.panel.id = "debug-panel";
    this.panel.style.cssText = `
      position: fixed; top: 8px; right: 8px;
      background: rgba(0,0,0,0.8); color: #0f0;
      font: 12px/1.5 monospace; padding: 8px 12px;
      border-radius: 4px; pointer-events: none;
      z-index: 1000; display: none; white-space: pre;
    `;
    document.body.appendChild(this.panel);

    window.addEventListener("keydown", (e) => {
      if (e.key === "`" || e.key === "F3") {
        this.toggle();
      }
    });
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  toggle() {
    this.enabled = !this.enabled;
    this.panel.style.display = this.enabled ? "block" : "none";
    if (!this.enabled) {
      this.clearWireframes();
    }
  }

  private clearWireframes() {
    for (const [, line] of this.wireframes) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    }
    this.wireframes.clear();
  }

  update(ball: Ball) {
    if (!this.enabled) return;

    // Update panel info
    const bp = ball.body.position;
    const bv = ball.body.velocity;
    const contacts = this.physics.world.contacts.length;
    const bodies = this.physics.world.bodies.length;

    this.panel.textContent =
      `DEBUG (press \` to toggle)\n` +
      `pos:  ${bp.x.toFixed(2)}, ${bp.y.toFixed(2)}, ${bp.z.toFixed(2)}\n` +
      `vel:  ${bv.x.toFixed(2)}, ${bv.y.toFixed(2)}, ${bv.z.toFixed(2)}\n` +
      `speed: ${bv.length().toFixed(2)}\n` +
      `contacts: ${contacts}  bodies: ${bodies}\n` +
      `sleeping: ${ball.body.sleepState === CANNON.Body.SLEEPING}`;

    // Sync wireframes to physics bodies
    const seenIds = new Set<number>();

    for (const body of this.physics.world.bodies) {
      seenIds.add(body.id);

      const existing = this.wireframes.get(body.id);
      let line: THREE.LineSegments;
      if (!existing) {
        const created = this.createWireframe(body);
        if (!created) continue;
        line = created;
        this.wireframes.set(body.id, line);
        this.scene.add(line);
      } else {
        line = existing;
      }

      // Update position and rotation
      line.position.set(body.position.x, body.position.y, body.position.z);
      line.quaternion.set(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w,
      );
    }

    // Remove wireframes for bodies that no longer exist
    for (const [id, line] of this.wireframes) {
      if (!seenIds.has(id)) {
        this.scene.remove(line);
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
        this.wireframes.delete(id);
      }
    }
  }

  private createWireframe(body: CANNON.Body): THREE.LineSegments | null {
    const shape = body.shapes[0];
    if (!shape) return null;

    let geo: THREE.BufferGeometry;
    let color = 0x00ff00;

    if (shape instanceof CANNON.Box) {
      const he = shape.halfExtents;
      geo = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(he.x * 2, he.y * 2, he.z * 2),
      );
      color = body.mass === 0 ? 0x00ff00 : 0xff4444;
    } else if (shape instanceof CANNON.Sphere) {
      geo = new THREE.EdgesGeometry(
        new THREE.SphereGeometry(shape.radius, 12, 8),
      );
      color = 0xff4444;
    } else {
      return null;
    }

    const mat = new THREE.LineBasicMaterial({
      color,
      depthTest: false,
      transparent: true,
      opacity: 0.9,
      linewidth: 1,
    });

    return new THREE.LineSegments(geo, mat);
  }

  destroy() {
    this.clearWireframes();
    this.panel.remove();
  }
}
