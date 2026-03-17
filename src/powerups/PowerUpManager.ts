import { CONFIG } from "../config";
import { PowerUpType } from "./PowerUpType";

interface ActivePowerUp {
  type: PowerUpType;
  remaining: number;
}

export class PowerUpManager {
  private activePowerUps: ActivePowerUp[] = [];

  onTimeBonus?: (deltaMs: number) => void;
  onActivated?: (type: PowerUpType) => void;
  onExpired?: (type: PowerUpType) => void;

  activate(type: PowerUpType) {
    const cfg = CONFIG.powerUp;

    if (type === PowerUpType.TimeBonus) {
      this.onTimeBonus?.(cfg.timeBonus);
      this.onActivated?.(type);
      return;
    }

    // Remove existing of same type before adding
    this.activePowerUps = this.activePowerUps.filter((p) => p.type !== type);

    let duration = 0;
    switch (type) {
      case PowerUpType.SpeedBoost:
        duration = cfg.speedBoostDuration;
        break;
      case PowerUpType.Shield:
        duration = cfg.shieldDuration;
        break;
      case PowerUpType.TimeFreeze:
        duration = cfg.timeFreezeDuration;
        break;
    }

    this.activePowerUps.push({ type, remaining: duration });
    this.onActivated?.(type);
  }

  update(dt: number) {
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      this.activePowerUps[i].remaining -= dt;
      if (this.activePowerUps[i].remaining <= 0) {
        const expired = this.activePowerUps.splice(i, 1)[0];
        this.onExpired?.(expired.type);
      }
    }
  }

  getSpeedMultiplier(): number {
    const active = this.activePowerUps.find(
      (p) => p.type === PowerUpType.SpeedBoost,
    );
    return active ? CONFIG.powerUp.speedBoostMultiplier : 1;
  }

  getBallScale(): number {
    return 1;
  }

  hasShield(): boolean {
    return this.activePowerUps.some((p) => p.type === PowerUpType.Shield);
  }

  isTimeFrozen(): boolean {
    return this.activePowerUps.some((p) => p.type === PowerUpType.TimeFreeze);
  }

  getActivePowerUps(): ReadonlyArray<ActivePowerUp> {
    return this.activePowerUps;
  }

  reset() {
    this.activePowerUps = [];
  }
}
