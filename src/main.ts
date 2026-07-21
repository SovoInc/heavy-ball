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
import { playAbduction, playElementalThreshold, playFall, playImpactAccent, playLevelComplete, playNearMiss, playPowerUp, playThermalShock, updateRoll, playFireCrackle, playIceCreak, playFreeze } from "./audio";
import { ElementalBuildup } from "./elemental/ElementalBuildup";
import { PowerUpManager } from "./powerups/PowerUpManager";
import { PowerUpType } from "./powerups/PowerUpType";
import { api, setAuthToken, shortenWalletAddress } from "./api";
import { getPlayer, setPlayer, clearPlayer, type PlayerState } from "./player";
import { hasMidnightWallet, connectMidnightWallet, watchWalletSync, getMidnightWalletError } from "./midnight";
import { MomentumEffects } from "./effects/MomentumEffects";
import { ContactEffects } from "./effects/ContactEffects";
import { SurfaceType } from "./objects/Path";
import { BALL_PROFILES, DEFAULT_BALL_ID, ballVersionKey, isBallId, type BallId } from "./balls";
import type { ElementalKind } from "./ballVisuals";

type GameState = "menu" | "playing" | "finishing" | "levelComplete" | "allComplete";

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
  private sessionToken = "";
  private currentBallScale = 1;
  private player: PlayerState | null = null;
  private elementalSoundTimer = 0;
  private momentumEffects: MomentumEffects;
  private contactEffects: ContactEffects;
  private speedIntensity = 0;
  private previousSpeed = 0;
  private impactCooldown = 0;
  private previousSurface: SurfaceType | null = null;
  private nearMissCooldown = 0;
  private runGeneration = 0;
  private currentBestMs: number | null = null;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private selectedBall: BallId = DEFAULT_BALL_ID;
  private elementalStage = 0;
  private elementalKind: ElementalKind = "neutral";
  private thermalShockCooldown = 0;

  private resetElementalPresentation() {
    this.elementalBuildup.reset();
    this.elementalStage = 0;
    this.elementalKind = "neutral";
    this.thermalShockCooldown = 0;
    this.ball.setElementalTint(0, 0);
    this.hud.updateElementalBuildup(0, 0);
  }

  constructor() {
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    this.renderer = new Renderer(canvas);
    this.physics = new Physics();
    this.ball = new Ball(this.renderer.scene, this.physics);
    this.controls = new Controls();
    this.camera = new GameCamera(this.renderer.camera);
    this.levelManager = new LevelManager(this.renderer.scene, this.physics);
    this.hud = new HUD();
    const savedBall = localStorage.getItem("heavy-ball-selected-ball");
    this.selectedBall = isBallId(savedBall) ? savedBall : DEFAULT_BALL_ID;
    this.applyBallProfile(this.selectedBall);
    this.debug = new DebugRenderer(this.renderer.scene, this.physics);
    this.powerUpManager = new PowerUpManager();
    this.elementalBuildup = new ElementalBuildup();
    this.momentumEffects = new MomentumEffects(this.renderer.scene);
    this.contactEffects = new ContactEffects(this.renderer.scene);
    this.controls.elementalBuildup = this.elementalBuildup;

    this.setupPowerUpCallbacks();
    this.setupHUDCallbacks();
    this.setupLevelSelectKey();

    // Local visual-development shortcut: /?level=37 boots directly into Level 37
    // as a guest. Vite replaces DEV at build time, so production always follows
    // the normal wallet/demo flow even if the query parameter is present.
    const devLevelIndex = this.getDevLevelIndex();
    if (devLevelIndex !== null) {
      this.player = { id: 0, alias: "Guest" };
      this.startLevel(devLevelIndex);
      return;
    }

    // Check for existing player — wallet required
    this.player = getPlayer();
    if (this.player && this.player.wallet_address) {
      if (this.player.auth_token) {
        setAuthToken(this.player.auth_token);
      }
      this.hud.networkId = this.player.network_id ?? "";
      this.showStartWithProgress();
    } else {
      // No wallet session — show connect screen
      clearPlayer();
      this.player = null;
      this.hud.showWalletLogin();
    }
  }

  private getDevLevelIndex(): number | null {
    if (!import.meta.env.DEV) return null;

    const requestedLevel = Number.parseInt(
      new URLSearchParams(window.location.search).get("level") ?? "",
      10,
    );
    if (!Number.isInteger(requestedLevel)) return null;

    return Math.min(Math.max(requestedLevel, 1), this.levelManager.levelCount) - 1;
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
    this.hud.onBallSelect = (id) => this.applyBallProfile(id);
    this.hud.onWalletConnect = async () => {
      this.hud.showWalletConnecting();
      try {
        const connection = await connectMidnightWallet();
        const network = connection.networkId;
        this.hud.networkId = network;
        this.hud.showWalletNetwork(network);

        // Wait for wallet to sync with the network before registering
        this.hud.showWalletSyncing(0);
        await watchWalletSync(connection.connectedApi, (pct) => {
          this.hud.showWalletSyncing(pct);
        });

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
        this.hud.showWalletError(getMidnightWalletError(err));
      }
    };

    this.hud.onWalletDisconnect = () => {
      clearPlayer();
      setAuthToken("");
      this.player = null;
      this.hud.showWalletLogin();
    };

    this.hud.onDemo = () => {
      this.player = { id: 0, alias: "Guest" };
      this.hud.showStartScreen(0, undefined, 0);
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

  private applyBallProfile(id: BallId) {
    this.selectedBall = id;
    const profile = BALL_PROFILES[id];
    this.ball.setProfile(id);
    this.controls.ballProfile = profile;
    this.hud.setSelectedBall(id);
    localStorage.setItem("heavy-ball-selected-ball", id);
  }

  private onLevelStart() {
    this.renderer.selectRandomBackground();
    this.state = "playing";
    this.fallCount = 0;
    this.speedBoosts = 0;
    this.sessionToken = "";
    this.powerUpManager.reset();
    this.resetElementalPresentation();
    this.ball.resetScale();
    this.currentBallScale = 1;
    this.speedIntensity = 0;
    this.previousSpeed = 0;
    this.nearMissCooldown = 0;
    this.contactEffects.reset();
    this.impactCooldown = 0;
    this.previousSurface = null;
    this.controls.speedMultiplier = 1;
    this.hud.clearPowerUps();
    this.hud.updateElementalBuildup(0, 0);
    this.hud.setLevel(this.levelManager.currentLevelName, this.levelManager.currentLevelNumber - 1);
    const bestKey = `heavy-ball-best-${this.levelManager.currentLevelNumber}-${ballVersionKey(BALL_PROFILES[this.selectedBall])}`;
    const storedBest = Number.parseInt(localStorage.getItem(bestKey) ?? "", 10);
    this.currentBestMs = Number.isFinite(storedBest) ? storedBest : null;
    this.hud.setBestTime(this.currentBestMs);
    this.camera.snapTo(this.ball);
    this.momentumEffects.reset(this.ball);
    this.controls.setEnabled(false);

    const generation = ++this.runGeneration;
    this.hud.showRunIntro(this.levelManager.currentLevelNumber, this.levelManager.currentLevelName);
    window.setTimeout(() => {
      if (generation !== this.runGeneration || this.state !== "playing") return;
      this.hud.startTimer();
      this.controls.setEnabled(true);
      if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("finish")) {
        const finish = this.levelManager.currentLevel?.finishZone.mesh.position;
        if (finish) this.ball.setPosition(finish.x, finish.y, finish.z);
      }
    }, 820);

    // Request a server session token for this level attempt
    if (this.player && this.player.id > 0) {
      const profile = BALL_PROFILES[this.selectedBall];
      api.startSession(this.player.id, this.levelManager.currentLevelNumber, profile.id, profile.version).then((res) => {
        this.sessionToken = res.session_token;
      }).catch(() => {
        this.sessionToken = "";
        this.hud.showToast("Offline — score won't be saved", "#ff6644");
      });
    }

    const level = this.levelManager.currentLevel;
    if (level) {
      level.onPowerUpCollected = (type) => {
        this.powerUpManager.activate(type);
      };
    }
  }

  private async submitScore(timeMs: number) {
    if (!this.player || this.player.id === 0) return;
    if (!this.sessionToken) return; // No session — can't submit

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
        ball_id: this.selectedBall,
        physics_version: BALL_PROFILES[this.selectedBall].version,
      }, this.sessionToken);
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
      const maxSpeed = BALL_PROFILES[this.selectedBall].maxSpeed * this.controls.speedMultiplier;
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
        const thermalShock = (
          (this.elementalBuildup.onFire && this.elementalBuildup.ice > 0.04)
          || (this.elementalBuildup.onIce && this.elementalBuildup.fire > 0.04)
        );
        this.elementalBuildup.update(dt, this.powerUpManager.hasShield());

        // Freeze trigger sound
        if (this.elementalBuildup.frozen && !wasFrozen) {
          playFreeze();
        }

        const elementalVisual = this.ball.setElementalTint(this.elementalBuildup.fire, this.elementalBuildup.ice);
        if (elementalVisual.kind !== this.elementalKind) {
          this.elementalKind = elementalVisual.kind;
          this.elementalStage = 0;
        }
        if (elementalVisual.stage > this.elementalStage && elementalVisual.kind !== "neutral") {
          this.elementalStage = elementalVisual.stage;
          playElementalThreshold(elementalVisual.kind, elementalVisual.stage);
          this.hud.pulseElemental(elementalVisual.kind, elementalVisual.stage);
          this.momentumEffects.burst(this.ball.mesh.position, elementalVisual.accent.getHex(), 0.7 + elementalVisual.stage * 0.12);
        } else if (elementalVisual.stage < this.elementalStage) {
          this.elementalStage = elementalVisual.stage;
        }

        this.thermalShockCooldown = Math.max(0, this.thermalShockCooldown - dt);
        if (thermalShock && this.thermalShockCooldown <= 0) {
          playThermalShock();
          this.hud.pulseElemental("shock");
          this.momentumEffects.burst(this.ball.mesh.position, 0xe8fbff, 0.85);
          this.thermalShockCooldown = 0.7;
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
        this.momentumEffects.burst(this.ball.mesh.position, 0xff6a3d, 1.2);
        this.ball.pulseImpact(1);
        this.hud.showEventFlash("impact");
        level.pendingShake = 0;
      }

      const normalizedSpeed = THREE.MathUtils.clamp(speed / Math.max(1, maxSpeed * 0.82), 0, 1);
      this.speedIntensity = THREE.MathUtils.lerp(
        this.speedIntensity,
        normalizedSpeed,
        Math.min(1, dt * (normalizedSpeed > this.speedIntensity ? 5.5 : 3.2)),
      );
      this.impactCooldown = Math.max(0, this.impactCooldown - dt);
      this.nearMissCooldown = Math.max(0, this.nearMissCooldown - dt);
      if (this.previousSpeed - speed > 2.7 && this.previousSpeed > 4.5 && this.impactCooldown <= 0) {
        const impactEnergy = this.previousSpeed - speed + this.previousSpeed * 0.45;
        this.momentumEffects.burst(this.ball.mesh.position, 0x62d9ff, Math.min(1.5, this.previousSpeed / 8));
        this.contactEffects.impact(this.ball.mesh.position, level?.ballSurfaceType ?? null, impactEnergy);
        level?.pulseNearbyRails(this.ball.mesh.position, impactEnergy / 8);
        this.ball.pulseImpact(Math.min(1, this.previousSpeed / 8));
        this.hud.showEventFlash("impact");
        const velocity = new THREE.Vector3(
          this.ball.body.velocity.x,
          this.ball.body.velocity.y,
          this.ball.body.velocity.z,
        );
        this.camera.addImpactImpulse(velocity, impactEnergy * 0.012);
        const impactTone = level?.ballSurfaceType === SurfaceType.Ice
          ? "ice"
          : level?.ballSurfaceType === SurfaceType.Lava ? "fire" : "metal";
        playImpactAccent(impactEnergy, impactTone);
        this.impactCooldown = 0.22;
      }
      this.previousSpeed = speed;
      this.hud.updateMomentum(this.speedIntensity, speed);

      if (level && speed > 6.2 && this.nearMissCooldown <= 0) {
        const nearMiss = level.findNearMiss(this.ball.mesh.position, 1.2);
        if (nearMiss) {
          this.contactEffects.nearMiss(nearMiss);
          this.camera.addImpactImpulse(
            this.ball.mesh.position.clone().sub(nearMiss),
            Math.min(0.07, speed * 0.006),
          );
          playNearMiss(speed);
          this.nearMissCooldown = 0.75;
        }
      }

      if (level && level.ballSurfaceType !== this.previousSurface) {
        const surfaceColors: Partial<Record<SurfaceType, number>> = {
          [SurfaceType.Ice]: 0x9eeaff,
          [SurfaceType.Lava]: 0xff4b22,
          [SurfaceType.Bounce]: 0xb9ff5a,
          [SurfaceType.Speed]: 0x62d9ff,
          [SurfaceType.Magnet]: 0xc267ff,
          [SurfaceType.Crumbling]: 0xffc46b,
        };
        const color = level.ballSurfaceType ? surfaceColors[level.ballSurfaceType] : undefined;
        if (color !== undefined) {
          this.momentumEffects.burst(this.ball.mesh.position, color, 0.85);
          if (level.ballSurfaceType === SurfaceType.Bounce) this.ball.pulseImpact(1);
        }
        this.previousSurface = level.ballSurfaceType;
      }

      if (!this.powerUpManager.isTimeFrozen()) {
        this.hud.updateTimer(dt);
      }

      updateRoll(speed);

      if (this.ball.position.y < CONFIG.world.fallThreshold) {
        this.resetElementalPresentation();
        if (!this.powerUpManager.hasShield()) {
          playFall();
          this.hud.showEventFlash("fall");
          this.momentumEffects.fall();
          this.fallCount++;
          this.screenShake = 0.3;
          this.levelManager.currentLevel!.restoreBoxes();
          this.ball.setPosition(
            ...this.levelManager.currentLevel!.startPosition,
          );
          this.camera.snapTo(this.ball);
          this.momentumEffects.reset(this.ball);
        } else {
          this.ball.setPosition(
            ...this.levelManager.currentLevel!.startPosition,
          );
          this.camera.snapTo(this.ball);
        }
      }

      if (this.levelManager.isComplete(this.ball)) {
        playLevelComplete();
        playAbduction();
        this.hud.showEventFlash("finish");
        this.momentumEffects.finish(this.ball);
        const timeMs = this.hud.stopTimer();
        this.controls.setEnabled(false);
        this.hud.clearPowerUps();
        this.resetElementalPresentation();

        this.submitScore(timeMs);

        const levelNum = this.levelManager.currentLevelNumber;
        const isPersonalBest = this.currentBestMs === null || timeMs < this.currentBestMs;
        if (isPersonalBest) {
          localStorage.setItem(`heavy-ball-best-${levelNum}-${ballVersionKey(BALL_PROFILES[this.selectedBall])}`, String(Math.round(timeMs)));
          this.currentBestMs = timeMs;
        }

        const lastLevel = this.levelManager.isLastLevel();
        this.state = "finishing";
        this.ball.beginAbduction();
        window.setTimeout(() => {
          if (this.state !== "finishing") return;
          if (lastLevel) {
            this.state = "allComplete";
            this.hud.showAllComplete(timeMs);
          } else {
            this.state = "levelComplete";
            this.hud.showLevelComplete(timeMs, false, levelNum, isPersonalBest);
          }
        }, this.reducedMotion ? 600 : 1500);
      }
    }

    if (this.state === "finishing") {
      const abductionProgress = this.ball.updateAbduction(dt);
      this.levelManager.updateFinish(dt, abductionProgress);
      this.speedIntensity = THREE.MathUtils.lerp(this.speedIntensity, 0, Math.min(1, dt * 5));
    }

    this.momentumEffects.update(this.ball, dt, this.speedIntensity);
    this.contactEffects.update(dt);
    this.camera.update(this.ball, this.speedIntensity, dt);
    this.renderer.updateSunTarget(
      this.ball.position.x,
      this.ball.position.y,
      this.ball.position.z,
    );

    if (this.screenShake > 0) {
      this.screenShake -= dt;
      this.camera.addImpactImpulse(new THREE.Vector3(0, 1, 0), this.screenShake * 0.035);
    }

    this.debug.update(this.ball);
    this.renderer.render(this.speedIntensity);
  };
}

const game = new Game();
game.start();
