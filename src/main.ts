import * as THREE from "three";
import { Renderer } from "./renderer";
import { Physics } from "./physics";
import { Ball } from "./objects/Ball";
import { Controls } from "./controls";
import { GameCamera } from "./camera";
import { LevelManager } from "./levels/LevelManager";
import { HUD } from "./hud";
import { CONFIG } from "./config";
import { DebugRenderer } from "./debug";
import { playFall, playLevelComplete, playPowerUp, updateRoll, playFireCrackle, playIceCreak, playFreeze } from "./audio";
import { ElementalBuildup } from "./elemental/ElementalBuildup";
import { PowerUpManager } from "./powerups/PowerUpManager";
import { PowerUpType } from "./powerups/PowerUpType";
import { api, setAuthToken, shortenWalletAddress } from "./api";
import { getPlayer, setPlayer, clearPlayer, type PlayerState } from "./player";
import { hasMidnightWallet, connectMidnightWallet, getMidnightWalletError, type MidnightNetworkId } from "./midnight";

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
  private powerUpManager: PowerUpManager;
  private elementalBuildup: ElementalBuildup;
  private state: GameState = "menu";
  private lastTime = 0;
  private screenShake = 0;
  private fallCount = 0;
  private speedBoosts = 0;
  private currentBallScale = 1;
  private player: PlayerState | null = null;
  private elementalSoundTimer = 0;

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
    this.powerUpManager = new PowerUpManager();
    this.elementalBuildup = new ElementalBuildup();
    this.controls.elementalBuildup = this.elementalBuildup;

    this.setupPowerUpCallbacks();
    this.setupHUDCallbacks();
    this.setupLevelSelectKey();

    // Check for existing player — wallet required
    this.player = getPlayer();
    if (this.player && this.player.wallet_address) {
      if (this.player.auth_token) {
        setAuthToken(this.player.auth_token);
      }
      this.showStartWithProgress();
    } else {
      // No wallet session — show connect screen
      clearPlayer();
      this.player = null;
      this.hud.showWalletLogin();
    }
  }

  private getPlayerIdentifier(): string | undefined {
    if (!this.player) return undefined;
    if (this.player.wallet_address) {
      return shortenWalletAddress(this.player.wallet_address);
    }
    return this.player.alias;
  }

  private async showStartWithProgress() {
    let continueLevel = 0;
    if (this.player && this.player.id > 0) {
      try {
        const progress = await api.getProgress(this.player.id);
        continueLevel = progress.max_level;
      } catch {
        // Offline — start from 0
      }
    }
    this.hud.showStartScreen(continueLevel, this.getPlayerIdentifier(), this.player?.id ?? 0);
  }

  private setupLevelSelectKey() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "`" && this.state === "menu") {
        if (this.hud.isLevelSelectVisible) {
          this.hud.hideLevelSelect();
        } else {
          this.hud.showLevelSelect(this.levelManager.levelCount, -1);
        }
      }
      if (e.key === "Escape" && this.hud.isLevelSelectVisible) {
        this.hud.hideLevelSelect();
      }
    });
  }

  private setupPowerUpCallbacks() {
    this.powerUpManager.onTimeBonus = (deltaMs) => {
      this.hud.adjustTimer(deltaMs);
      this.hud.showToast(`-${(deltaMs / 1000).toFixed(0)}s`, "#44ddff");
    };

    this.powerUpManager.onActivated = (type) => {
      playPowerUp();
      if (type === PowerUpType.SpeedBoost) this.speedBoosts++;
      if (type !== PowerUpType.TimeBonus) {
        const names: Record<string, string> = {
          [PowerUpType.SpeedBoost]: "Speed Boost!",
          [PowerUpType.Shield]: "Shield!",
          [PowerUpType.TimeFreeze]: "Time Freeze!",
        };
        const colors: Record<string, string> = {
          [PowerUpType.SpeedBoost]: "#ff8844",
          [PowerUpType.Shield]: "#44ff88",
          [PowerUpType.TimeFreeze]: "#ffdd44",
        };
        this.hud.showToast(names[type] ?? type, colors[type] ?? "#ffffff");
      }
    };

    this.powerUpManager.onExpired = () => {};
  }

  private setupHUDCallbacks() {
    this.hud.onWalletConnect = async (networkId: string) => {
      this.hud.showWalletConnecting();
      const network = networkId as MidnightNetworkId;
      try {
        const connection = await connectMidnightWallet(network);
        const data = await api.registerWallet(connection.address, network);
        this.player = {
          id: data.id,
          alias: data.alias ?? `wallet:${connection.address}`,
          wallet_address: data.wallet_address ?? connection.address,
          network_id: data.network_id ?? network,
          auth_token: data.auth_token,
        };
        if (data.auth_token) {
          setAuthToken(data.auth_token);
        }
        setPlayer(this.player);
        await this.showStartWithProgress();
      } catch (err) {
        this.hud.showWalletError(getMidnightWalletError(err, network));
      }
    };

    this.hud.onWalletDisconnect = () => {
      clearPlayer();
      setAuthToken("");
      this.player = null;
      this.hud.showWalletLogin();
    };

    this.hud.onStart = () => {
      this.startLevel(0);
    };

    this.hud.onGiveUp = () => {
      this.controls.setEnabled(false);
      this.hud.stopTimer();
      this.hud.clearPowerUps();
      this.state = "menu";
      this.showStartWithProgress();
    };

    this.hud.onNextLevel = () => {
      this.hud.hideOverlay();
      const hasNext = this.levelManager.nextLevel(this.ball);
      if (hasNext) {
        this.onLevelStart();
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
    this.onLevelStart();
  }

  private onLevelStart() {
    this.state = "playing";
    this.fallCount = 0;
    this.speedBoosts = 0;
    this.powerUpManager.reset();
    this.elementalBuildup.reset();
    this.ball.resetScale();
    this.currentBallScale = 1;
    this.controls.speedMultiplier = 1;
    this.hud.clearPowerUps();
    this.hud.updateElementalBuildup(0, 0);
    this.hud.setLevel(this.levelManager.currentLevelName, this.levelManager.currentLevelNumber - 1);
    this.hud.startTimer();
    this.camera.snapTo(this.ball);
    this.controls.setEnabled(true);

    const level = this.levelManager.currentLevel;
    if (level) {
      level.onPowerUpCollected = (type) => {
        this.powerUpManager.activate(type);
      };
    }
  }

  private async submitScore(timeMs: number) {
    if (!this.player || this.player.id === 0) return;

    const level = this.levelManager.currentLevel;
    const levelNumber = this.levelManager.currentLevelNumber;

    try {
      const result = await api.submitScore({
        player_id: this.player.id,
        level: levelNumber,
        time_ms: Math.round(timeMs),
        boxes_broken: level?.boxesBroken ?? 0,
        power_ups_collected: level?.powerUpsCollected ?? 0,
        fall_count: this.fallCount,
        speed_boosts: this.speedBoosts,
        fire_maxed: this.elementalBuildup.fireMaxed,
        ice_maxed: this.elementalBuildup.iceMaxed,
      });
      if (result.achievements_unlocked.length > 0) {
        this.hud.showAchievementUnlocked(result.achievements_unlocked, result.achievements_display);
      }
    } catch {
      // Silently fail if server is down
    }
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
      // Apply power-up effects
      this.controls.speedMultiplier = this.powerUpManager.getSpeedMultiplier();

      const targetScale = this.powerUpManager.getBallScale();
      if (targetScale !== this.currentBallScale) {
        this.currentBallScale = targetScale;
        this.ball.setScale(targetScale);
      }

      this.controls.update(this.ball, this.camera.getAngle());

      this.physics.step(dt);

      const vel = this.ball.body.velocity;
      const speed = vel.length();
      const maxSpeed = CONFIG.ball.maxSpeed * this.controls.speedMultiplier;
      if (speed > maxSpeed) {
        vel.scale(maxSpeed / speed, vel);
      }

      this.ball.syncMesh(dt);
      this.levelManager.update(dt, this.powerUpManager.hasShield());
      this.powerUpManager.update(dt);

      // Elemental buildup system
      const lvl = this.levelManager.currentLevel;
      if (lvl) {
        const wasFrozen = this.elementalBuildup.frozen;
        this.elementalBuildup.onFire = lvl.ballOnLava;
        this.elementalBuildup.onIce = lvl.ballOnIce;
        this.elementalBuildup.update(dt, this.powerUpManager.hasShield());

        // Freeze trigger sound
        if (this.elementalBuildup.frozen && !wasFrozen) {
          playFreeze();
        }

        // Ball tint
        const ballMat = this.ball.mesh.material as THREE.MeshStandardMaterial;
        if (this.elementalBuildup.fire > 0.01) {
          const t = this.elementalBuildup.fire;
          ballMat.emissive.setRGB(t * 1.0, t * 0.3, 0);
        } else if (this.elementalBuildup.ice > 0.01) {
          const t = this.elementalBuildup.ice;
          ballMat.emissive.setRGB(0, t * 0.4, t * 1.0);
        } else {
          ballMat.emissive.setRGB(0, 0, 0);
        }

        // Elemental ambient sounds
        this.elementalSoundTimer -= dt;
        if (this.elementalSoundTimer <= 0) {
          if (this.elementalBuildup.fire > 0.3) {
            playFireCrackle(this.elementalBuildup.fire);
            this.elementalSoundTimer = 0.3 + Math.random() * 0.3;
          } else if (this.elementalBuildup.ice > 0.3) {
            playIceCreak(this.elementalBuildup.ice);
            this.elementalSoundTimer = 0.5 + Math.random() * 0.5;
          } else {
            this.elementalSoundTimer = 0.2;
          }
        }

        this.hud.updateElementalBuildup(this.elementalBuildup.fire, this.elementalBuildup.ice);
      }

      this.hud.updatePowerUps(this.powerUpManager.getActivePowerUps());

      const level = this.levelManager.currentLevel;
      if (level && level.pendingShake > 0) {
        this.screenShake = level.pendingShake;
        level.pendingShake = 0;
      }

      if (!this.powerUpManager.isTimeFrozen()) {
        this.hud.updateTimer(dt);
      }

      updateRoll(speed);

      if (this.ball.position.y < CONFIG.world.fallThreshold) {
        this.elementalBuildup.reset();
        this.hud.updateElementalBuildup(0, 0);
        if (!this.powerUpManager.hasShield()) {
          playFall();
          this.fallCount++;
          this.screenShake = 0.3;
          this.levelManager.currentLevel!.restoreBoxes();
          this.ball.setPosition(
            ...this.levelManager.currentLevel!.startPosition,
          );
          this.camera.snapTo(this.ball);
        } else {
          this.ball.setPosition(
            ...this.levelManager.currentLevel!.startPosition,
          );
          this.camera.snapTo(this.ball);
        }
      }

      if (this.levelManager.isComplete(this.ball)) {
        playLevelComplete();
        const timeMs = this.hud.stopTimer();
        this.controls.setEnabled(false);
        this.hud.clearPowerUps();
        this.elementalBuildup.reset();
        this.hud.updateElementalBuildup(0, 0);

        this.submitScore(timeMs);

        const levelNum = this.levelManager.currentLevelNumber;

        if (this.levelManager.isLastLevel()) {
          this.state = "allComplete";
          this.hud.showAllComplete(timeMs);
        } else {
          this.state = "levelComplete";
          this.hud.showLevelComplete(timeMs, false, levelNum);
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
