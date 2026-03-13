import * as THREE from "three";
import { Physics } from "../physics";
import { Level, type LevelData } from "./Level";
import { LEVEL_1 } from "./Level1";
import { LEVEL_2 } from "./Level2";
import { LEVEL_3 } from "./Level3";
import { LEVEL_4 } from "./Level4";
import { LEVEL_5 } from "./Level5";
import { LEVEL_6 } from "./Level6";
import { LEVEL_7 } from "./Level7";
import { LEVEL_8 } from "./Level8";
import { LEVEL_9 } from "./Level9";
import { LEVEL_10 } from "./Level10";
import { LEVEL_11 } from "./Level11";
import { LEVEL_12 } from "./Level12";
import { LEVEL_13 } from "./Level13";
import { LEVEL_14 } from "./Level14";
import { LEVEL_15 } from "./Level15";
import { LEVEL_16 } from "./Level16";
import { LEVEL_17 } from "./Level17";
import { LEVEL_18 } from "./Level18";
import { LEVEL_19 } from "./Level19";
import { LEVEL_20 } from "./Level20";
import type { Ball } from "../objects/Ball";

const ALL_LEVELS: LevelData[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10,
  LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15,
  LEVEL_16, LEVEL_17, LEVEL_18, LEVEL_19, LEVEL_20,
];

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
