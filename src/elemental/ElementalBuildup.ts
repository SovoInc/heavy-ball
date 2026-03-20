import * as CANNON from "cannon-es";
import { CONFIG } from "../config";

const FC = CONFIG.elemental.fire;
const IC = CONFIG.elemental.ice;

export class ElementalBuildup {
  fire = 0;
  ice = 0;
  onFire = false;
  onIce = false;
  frozen = false;
  frozenTimer = 0;
  fireMaxed = false;
  iceMaxed = false;

  private smoothedForce = new CANNON.Vec3();

  update(dt: number, shielded: boolean) {
    // Frozen countdown
    if (this.frozen) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0) {
        this.frozen = false;
        this.ice = 0.8;
      }
      return;
    }

    if (shielded) {
      this.fire = Math.max(0, this.fire - FC.decayRate * dt);
      this.ice = Math.max(0, this.ice - IC.decayRate * dt);
      return;
    }

    if (this.onFire && this.onIce) {
      // Both at once: counteract each other, build neither
      this.fire = Math.max(0, this.fire - IC.counteractRate * dt);
      this.ice = Math.max(0, this.ice - FC.counteractRate * dt);
    } else if (this.onFire) {
      this.ice = Math.max(0, this.ice - FC.counteractRate * dt);
      if (this.ice <= 0) {
        this.fire = Math.min(1, this.fire + FC.buildRate * dt);
      }
    } else if (this.onIce) {
      this.fire = Math.max(0, this.fire - IC.counteractRate * dt);
      if (this.fire <= 0) {
        this.ice = Math.min(1, this.ice + IC.buildRate * dt);
      }
    } else {
      // On neither — natural decay
      this.fire = Math.max(0, this.fire - FC.decayRate * dt);
      this.ice = Math.max(0, this.ice - IC.decayRate * dt);
    }

    // Track max fire
    if (this.fire >= 1.0) {
      this.fireMaxed = true;
    }

    // Check freeze trigger
    if (this.ice >= 1.0) {
      this.frozen = true;
      this.frozenTimer = IC.freezeDuration;
      this.ice = 1.0;
      this.iceMaxed = true;
    }
  }

  modifyForce(force: CANNON.Vec3): void {
    if (this.frozen) {
      force.set(0, 0, 0);
      return;
    }

    // Fire: unstable speed + sporadic jolts + twitchy steering
    if (this.fire > 0.01) {
      const t = this.fire;

      // Speed amplification — everything feels too fast
      const boost = 1 + t * (FC.speedBoost - 1);
      force.scale(boost, force);

      // Amplify the perpendicular component so turning overshoots
      // Decompose force into forward (along force direction) and lateral
      const len = Math.sqrt(force.x * force.x + force.z * force.z);
      if (len > 0.1) {
        const turnAmp = 1 + t * (FC.turnAmplify - 1);
        // Rotate force slightly by a random angle scaled by buildup
        const jitterAngle = (Math.random() - 0.5) * t * 0.6;
        const cos = Math.cos(jitterAngle);
        const sin = Math.sin(jitterAngle);
        const fx = force.x * cos - force.z * sin;
        const fz = force.x * sin + force.z * cos;
        force.x = fx * turnAmp;
        force.z = fz * turnAmp;
        // Re-scale so the magnitude boost is consistent
        const newLen = Math.sqrt(force.x * force.x + force.z * force.z);
        if (newLen > 0.1) {
          const desired = len * boost;
          const rescale = desired / newLen;
          // Blend: keep some of the overshoot on turns
          const blend = 0.5 + 0.5 * t;
          const finalScale = rescale * (1 - blend) + blend;
          force.x *= finalScale;
          force.z *= finalScale;
        }
      }

      // Sporadic spasms — sudden sharp jolts in random directions
      if (Math.random() < FC.spasmChance * t) {
        const angle = Math.random() * Math.PI * 2;
        const mag = FC.spasmForce * (0.5 + 0.5 * t);
        force.x += Math.cos(angle) * mag;
        force.z += Math.sin(angle) * mag;
      }

      // Direction flips at high buildup
      if (t > FC.directionFlipThreshold && Math.random() < FC.directionFlipChance) {
        force.x = -force.x;
        force.z = -force.z;
      }
    }

    // Ice: sluggish controls
    if (this.ice > 0.01) {
      const reduction = 1 - this.ice * IC.maxReduction;
      force.scale(reduction, force);

      // Lerp toward smoothed force for input lag
      const smoothing = this.ice * IC.smoothingMax;
      this.smoothedForce.x = this.smoothedForce.x * smoothing + force.x * (1 - smoothing);
      this.smoothedForce.y = this.smoothedForce.y * smoothing + force.y * (1 - smoothing);
      this.smoothedForce.z = this.smoothedForce.z * smoothing + force.z * (1 - smoothing);
      force.copy(this.smoothedForce);
    }
  }

  reset() {
    this.fire = 0;
    this.ice = 0;
    this.frozen = false;
    this.frozenTimer = 0;
    this.fireMaxed = false;
    this.iceMaxed = false;
    this.smoothedForce.set(0, 0, 0);
  }
}
