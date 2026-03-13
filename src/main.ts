import { Renderer } from "./renderer";
import { Physics } from "./physics";
import { Ball } from "./objects/Ball";
import { Controls } from "./controls";
import { GameCamera } from "./camera";
import { LevelManager } from "./levels/LevelManager";
import { HUD } from "./hud";
import { CONFIG } from "./config";
import { DebugRenderer } from "./debug";
import { playFall, playLevelComplete, updateRoll } from "./audio";

type GameState = "menu" | "playing" | "levelComplete" | "allComplete";

class Game {
  private renderer: Renderer;
  private physics: Physics;
  private ball: Ball;
  private controls: Controls;
  private camera: GameCamera;
  private levelManager: LevelManager;
  private hud: HUD;
  private debug: DebugRenderer;
  private state: GameState = "menu";
  private lastTime = 0;
  private restartCooldown = 0;
  private screenShake = 0;

  constructor() {
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    this.renderer = new Renderer(canvas);
    this.physics = new Physics();
    this.ball = new Ball(this.renderer.scene, this.physics);
    this.controls = new Controls();
    this.camera = new GameCamera(this.renderer.camera);
    this.levelManager = new LevelManager(this.renderer.scene, this.physics);
    this.hud = new HUD();
    this.debug = new DebugRenderer(this.renderer.scene, this.physics);

    this.setupHUDCallbacks();
    this.hud.showStartScreen();
  }

  private setupHUDCallbacks() {
    this.hud.onStart = () => {
      this.startLevel(0);
    };

    this.hud.onRestart = () => {
      this.restartCurrentLevel();
    };

    this.hud.onNextLevel = () => {
      this.hud.hideOverlay();
      const hasNext = this.levelManager.nextLevel(this.ball);
      if (hasNext) {
        this.state = "playing";
        this.hud.setLevel(this.levelManager.currentLevelName);
        this.hud.startTimer();
        this.camera.snapTo(this.ball);
        this.controls.setEnabled(true);
      }
    };

    this.hud.onLevelSelect = (index: number) => {
      this.startLevel(index);
    };
  }

  private startLevel(index: number) {
    this.hud.hideOverlay();
    this.hud.hideControlsHint();
    this.levelManager.load(index, this.ball);
    this.state = "playing";
    this.hud.setLevel(this.levelManager.currentLevelName);
    this.hud.startTimer();
    this.camera.snapTo(this.ball);
    this.controls.setEnabled(true);
  }

  private restartCurrentLevel() {
    this.hud.hideOverlay();
    this.levelManager.restartCurrent(this.ball);
    this.state = "playing";
    this.hud.startTimer();
    this.camera.snapTo(this.ball);
    this.controls.setEnabled(true);
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  private loop = (now: number) => {
    requestAnimationFrame(this.loop);

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (this.state === "playing") {
      this.controls.update(this.ball, this.camera.getAngle());
      this.physics.step(dt);

      const vel = this.ball.body.velocity;
      const speed = vel.length();
      if (speed > CONFIG.ball.maxSpeed) {
        vel.scale(CONFIG.ball.maxSpeed / speed, vel);
      }

      this.ball.syncMesh();
      this.levelManager.update(dt);

      const level = this.levelManager.currentLevel;
      if (level && level.pendingShake > 0) {
        this.screenShake = level.pendingShake;
        level.pendingShake = 0;
      }

      this.hud.updateTimer(dt);

      if (this.controls.isRestartPressed()) {
        this.restartCooldown -= dt;
        if (this.restartCooldown <= 0) {
          this.restartCooldown = 0.5;
          this.restartCurrentLevel();
        }
      } else {
        this.restartCooldown = 0;
      }

      updateRoll(speed);

      if (this.ball.position.y < CONFIG.world.fallThreshold) {
        playFall();
        this.screenShake = 0.3;
        this.ball.setPosition(
          ...this.levelManager.currentLevel!.startPosition,
        );
        this.camera.snapTo(this.ball);
      }

      if (this.levelManager.isComplete(this.ball)) {
        playLevelComplete();
        const timeMs = this.hud.stopTimer();
        this.controls.setEnabled(false);

        if (this.levelManager.isLastLevel()) {
          this.state = "allComplete";
          this.hud.showAllComplete(timeMs);
        } else {
          this.state = "levelComplete";
          this.hud.showLevelComplete(timeMs, false);
        }
      }
    }

    this.camera.update(this.ball);
    this.renderer.updateSunTarget(
      this.ball.position.x,
      this.ball.position.y,
      this.ball.position.z,
    );

    if (this.screenShake > 0) {
      this.screenShake -= dt;
      const intensity = this.screenShake * 0.3;
      this.renderer.camera.position.x += (Math.random() - 0.5) * intensity;
      this.renderer.camera.position.y += (Math.random() - 0.5) * intensity;
    }

    this.debug.update(this.ball);
    this.renderer.render();
  };
}

const game = new Game();
game.start();
