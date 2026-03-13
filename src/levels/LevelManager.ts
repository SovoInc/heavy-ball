import * as THREE from "three";
import { Physics } from "../physics";
import { Level, type LevelData } from "./Level";
import { LEVEL_1 } from "./Level1";
import { LEVEL_2 } from "./Level2";
import { LEVEL_3 } from "./Level3";
import type { Ball } from "../objects/Ball";

const ALL_LEVELS: LevelData[] = [LEVEL_1, LEVEL_2, LEVEL_3];

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

  update(dt: number) {
    this.currentLevel?.update(dt);
  }

  isComplete(ball: Ball): boolean {
    return this.currentLevel?.isComplete(ball) ?? false;
  }

  isLastLevel(): boolean {
    return this.currentIndex >= ALL_LEVELS.length - 1;
  }
}
