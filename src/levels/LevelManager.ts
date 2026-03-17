import * as THREE from "three";
import { Physics } from "../physics";
import { Level } from "./Level";
import { ALL_LEVELS } from "./allLevels";
import type { Ball } from "../objects/Ball";

export class LevelManager {
  private currentIndex = 0;
  currentLevel: Level | null = null;

  constructor(
    private scene: THREE.Scene,
    private physics: Physics,
  ) {}

  get levelCount(): number {
    return ALL_LEVELS.length;
  }

  get currentLevelNumber(): number {
    return this.currentIndex + 1;
  }

  get currentLevelName(): string {
    return this.currentLevel?.name ?? "";
  }

  load(index: number, ball: Ball) {
    if (this.currentLevel) {
      this.currentLevel.destroy();
    }

    this.currentIndex = Math.min(index, ALL_LEVELS.length - 1);
    const data = ALL_LEVELS[this.currentIndex];
    this.currentLevel = new Level(this.scene, this.physics, data);
    this.currentLevel.build(ball);

    ball.setPosition(...data.startPosition);
  }

  restartCurrent(ball: Ball) {
    this.load(this.currentIndex, ball);
  }

  nextLevel(ball: Ball): boolean {
    if (this.currentIndex + 1 >= ALL_LEVELS.length) {
      return false;
    }
    this.load(this.currentIndex + 1, ball);
    return true;
  }

  update(dt: number, shielded = false) {
    this.currentLevel?.update(dt, shielded);
  }

  isComplete(ball: Ball): boolean {
    return this.currentLevel?.isComplete(ball) ?? false;
  }

  isLastLevel(): boolean {
    return this.currentIndex >= ALL_LEVELS.length - 1;
  }
}
