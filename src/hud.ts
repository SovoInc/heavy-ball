import { PowerUpType } from "./powerups/PowerUpType";
import { CONFIG } from "./config";
import { api, type ScoreEntry, type LeaderboardEntry, getDisplayName } from "./api";

const POWER_UP_NAMES: Record<PowerUpType, string> = {
  [PowerUpType.TimeBonus]: "Time Bonus",
  [PowerUpType.SpeedBoost]: "Speed Boost",
  [PowerUpType.Shield]: "Shield",
  [PowerUpType.TimeFreeze]: "Time Freeze",
};

const POWER_UP_CSS_COLORS: Record<PowerUpType, string> = {
  [PowerUpType.TimeBonus]: "#44ddff",
  [PowerUpType.SpeedBoost]: "#ff8844",
  [PowerUpType.Shield]: "#44ff88",
  [PowerUpType.TimeFreeze]: "#ffdd44",
};

const POWER_UP_DURATIONS: Record<PowerUpType, number> = {
  [PowerUpType.TimeBonus]: 0,
  [PowerUpType.SpeedBoost]: CONFIG.powerUp.speedBoostDuration,
  [PowerUpType.Shield]: CONFIG.powerUp.shieldDuration,
  [PowerUpType.TimeFreeze]: CONFIG.powerUp.timeFreezeDuration,
};

export class HUD {
  private levelEl: HTMLElement;
  private timerEl: HTMLElement;
  private restartBtn: HTMLElement;
  private overlay: HTMLElement;
  private overlayH1: HTMLElement;
  private overlayP: HTMLElement;
  private overlayBtns: HTMLElement;
  private overlayTime: HTMLElement;
  private controlsHint: HTMLElement;
  private powerupsEl: HTMLElement;
  private toastEl: HTMLElement;
  private leaderboardPanel: HTMLElement;
  private statsPanel: HTMLElement;
  private levelSelectEl: HTMLElement;

  private elapsedMs = 0;
  private running = false;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentLevelIndex = 0;

  onGiveUp?: () => void;
  onStart?: () => void;
  onNextLevel?: () => void;
  onLevelSelect?: (index: number) => void;
  onAliasSubmit?: (alias: string) => void;
  onWalletConnect?: () => void;
  onWalletDisconnect?: () => void;

  constructor() {
    this.levelEl = document.getElementById("hud-level")!;
    this.timerEl = document.getElementById("hud-timer")!;
    this.restartBtn = document.getElementById("hud-restart")!;
    this.overlay = document.getElementById("overlay")!;
    this.overlayH1 = this.overlay.querySelector("h1")!;
    this.overlayP = this.overlay.querySelector("p")!;
    this.overlayBtns = document.getElementById("overlay-buttons")!;
    this.overlayTime = document.getElementById("overlay-time")!;
    this.controlsHint = document.getElementById("controls-hint")!;
    this.powerupsEl = document.getElementById("hud-powerups")!;
    this.toastEl = document.getElementById("hud-toast")!;
    this.leaderboardPanel = document.getElementById("leaderboard-panel")!;
    this.statsPanel = document.getElementById("stats-panel")!;

    // Create level select popup
    this.levelSelectEl = document.createElement("div");
    this.levelSelectEl.id = "level-select";
    this.levelSelectEl.style.cssText = `
      display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      background:rgba(10,10,20,0.95);border:1px solid rgba(255,255,255,0.15);
      border-radius:12px;padding:20px;z-index:1000;max-height:80vh;overflow-y:auto;
      min-width:220px;
    `;
    document.body.appendChild(this.levelSelectEl);

    this.restartBtn.textContent = "Give Up";
    this.restartBtn.addEventListener("click", () => this.onGiveUp?.());
    this.overlayBtns.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.id === "btn-start") this.onStart?.();
      if (target.id === "btn-continue") {
        const level = parseInt(target.dataset.level ?? "0");
        this.onLevelSelect?.(level);
      }
      if (target.id === "btn-next") this.onNextLevel?.();
      if (target.id === "btn-replay") this.onLevelSelect?.(this.currentLevelIndex);
      if (target.id === "btn-play-again") this.onLevelSelect?.(0);
      if (target.id === "btn-alias-submit") {
        const input = document.getElementById("alias-input") as HTMLInputElement;
        const alias = input?.value.trim();
        if (alias) this.onAliasSubmit?.(alias);
      }
      if (target.id === "btn-wallet-connect") {
        this.onWalletConnect?.();
      }
      if (target.id === "btn-wallet-disconnect") {
        this.onWalletDisconnect?.();
      }
      if (target.id === "btn-leaderboard") {
        this.toggleLeaderboard(parseInt(target.dataset.level ?? "1"));
      }
      if (target.id === "btn-highscores") {
        this.toggleGlobalLeaderboard();
      }
    });
  }

  setLevel(name: string, index: number) {
    this.levelEl.textContent = name;
    this.currentLevelIndex = index;
  }

  startTimer() {
    this.elapsedMs = 0;
    this.running = true;
  }

  stopTimer(): number {
    this.running = false;
    return this.elapsedMs;
  }

  updateTimer(dt: number) {
    if (!this.running) return;
    this.elapsedMs += dt * 1000;
    this.timerEl.textContent = this.formatTime(this.elapsedMs);
  }

  adjustTimer(deltaMs: number) {
    this.elapsedMs = Math.max(0, this.elapsedMs - deltaMs);
    this.timerEl.textContent = this.formatTime(this.elapsedMs);
  }

  private formatTime(ms: number): string {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = Math.floor(totalSec % 60);
    const tenth = Math.floor((totalSec * 10) % 10);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${tenth}`;
  }

  showToast(text: string, color: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastEl.textContent = text;
    this.toastEl.style.color = color;
    this.toastEl.classList.add("show");
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove("show");
    }, 1500);
  }

  updatePowerUps(activePowerUps: ReadonlyArray<{ type: PowerUpType; remaining: number }>) {
    this.powerupsEl.innerHTML = "";
    for (const p of activePowerUps) {
      const maxDuration = POWER_UP_DURATIONS[p.type];
      if (maxDuration <= 0) continue;
      const pct = Math.max(0, (p.remaining / maxDuration) * 100);
      const color = POWER_UP_CSS_COLORS[p.type];

      const div = document.createElement("div");
      div.className = "powerup-indicator";
      div.innerHTML = `
        <span style="color:${color}">${POWER_UP_NAMES[p.type]}</span>
        <div class="powerup-bar">
          <div class="powerup-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      `;
      this.powerupsEl.appendChild(div);
    }
  }

  clearPowerUps() {
    this.powerupsEl.innerHTML = "";
  }

  showAliasEntry(hasWallet = false) {
    this.overlayH1.textContent = "Heavy Ball";
    this.overlayP.textContent = hasWallet
      ? "Connect your wallet or enter a name"
      : "Enter your name to play";

    const walletBtn = hasWallet
      ? `<button class="overlay-btn" id="btn-wallet-connect">Connect Wallet</button>
         <div style="opacity:0.4;font-size:13px;margin:8px 0">or</div>`
      : "";

    this.overlayBtns.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
        ${walletBtn}
        <input type="text" id="alias-input" placeholder="Your name" maxlength="20" autocomplete="off" />
        <button class="overlay-btn${hasWallet ? " secondary" : ""}" id="btn-alias-submit">Play</button>
      </div>
    `;
    this.overlayTime.style.display = "none";
    this.leaderboardPanel.style.display = "none";
    this.statsPanel.style.display = "none";
    this.overlay.classList.remove("hidden");

    // Focus input after render
    requestAnimationFrame(() => {
      const input = document.getElementById("alias-input") as HTMLInputElement;
      input?.focus();
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const alias = input.value.trim();
          if (alias) this.onAliasSubmit?.(alias);
        }
      });
    });
  }

  showWalletConnecting() {
    const btn = document.getElementById("btn-wallet-connect");
    if (btn) {
      btn.textContent = "Connecting...";
      (btn as HTMLButtonElement).disabled = true;
    }
  }

  showWalletError(message: string) {
    const btn = document.getElementById("btn-wallet-connect");
    if (btn) {
      btn.textContent = "Connect Wallet";
      (btn as HTMLButtonElement).disabled = false;
    }
    // Show error below buttons
    let errorEl = document.getElementById("wallet-error");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.id = "wallet-error";
      errorEl.style.cssText = "color:#ff6666;font-size:13px;margin-top:8px;text-align:center";
      this.overlayBtns.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  showStartScreen(continueLevel = 0, playerIdentifier?: string) {
    this.overlayH1.textContent = "Heavy Ball";

    let statusText = "";
    if (playerIdentifier) {
      statusText = `<span style="font-size:13px;opacity:0.5">${this.escapeHtml(playerIdentifier)}</span><br>`;
    }

    if (continueLevel > 0) {
      this.overlayP.innerHTML = `${statusText}Progress: Level ${continueLevel} completed`;
    } else {
      this.overlayP.innerHTML = `${statusText}Guide the ball to the finish`;
    }

    const disconnectBtn = playerIdentifier
      ? `<button class="overlay-btn secondary" id="btn-wallet-disconnect" style="font-size:12px;padding:6px 16px">Logout</button>`
      : "";

    const btns = continueLevel > 0
      ? `<button class="overlay-btn" id="btn-continue" data-level="${continueLevel}">Continue (Level ${continueLevel + 1})</button>
         <button class="overlay-btn secondary" id="btn-start">New Game</button>
         <button class="overlay-btn secondary" id="btn-highscores">High Scores</button>
         ${disconnectBtn}`
      : `<button class="overlay-btn" id="btn-start">Start</button>
         <button class="overlay-btn secondary" id="btn-highscores">High Scores</button>
         ${disconnectBtn}`;

    this.overlayBtns.innerHTML = btns;
    this.overlayTime.style.display = "none";
    this.leaderboardPanel.style.display = "none";
    this.statsPanel.style.display = "none";
    this.overlay.classList.remove("hidden");
  }

  showLevelComplete(timeMs: number, isLastLevel: boolean, levelNumber?: number) {
    this.overlayH1.textContent = "Level Complete!";
    this.overlayP.textContent = "";
    this.overlayTime.style.display = "block";
    this.overlayTime.textContent = `Time: ${this.formatTime(timeMs)}`;
    this.leaderboardPanel.style.display = "none";
    this.statsPanel.style.display = "none";

    const leaderboardBtn = levelNumber
      ? `<button class="overlay-btn secondary" id="btn-leaderboard" data-level="${levelNumber}">Leaderboard</button>`
      : "";

    if (isLastLevel) {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn" id="btn-replay">Play Again</button>
        ${leaderboardBtn}
      `;
    } else {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn" id="btn-next">Next Level</button>
        <button class="overlay-btn secondary" id="btn-replay">Replay</button>
        ${leaderboardBtn}
      `;
    }

    this.overlay.classList.remove("hidden");
  }

  showAllComplete(timeMs: number) {
    this.overlayH1.textContent = "You Win!";
    this.overlayP.textContent = "All levels complete";
    this.overlayTime.style.display = "block";
    this.overlayTime.textContent = `Final time: ${this.formatTime(timeMs)}`;
    this.leaderboardPanel.style.display = "none";
    this.statsPanel.style.display = "none";
    this.overlayBtns.innerHTML = `
      <button class="overlay-btn" id="btn-play-again">Play Again</button>
    `;
    this.overlay.classList.remove("hidden");
  }

  private async toggleGlobalLeaderboard() {
    if (this.leaderboardPanel.style.display === "block") {
      this.leaderboardPanel.style.display = "none";
      return;
    }

    this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.5'>Loading...</p>";
    this.leaderboardPanel.style.display = "block";

    try {
      const entries = await api.getLeaderboard(20);
      if (entries.length === 0) {
        this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.5'>No scores yet</p>";
        return;
      }
      this.leaderboardPanel.innerHTML = `
        <table>
          <thead><tr><th>#</th><th>Player</th><th>Level</th><th>Total Time</th></tr></thead>
          <tbody>
            ${entries.map((s: LeaderboardEntry) => `
              <tr>
                <td>${s.rank}</td>
                <td>${this.escapeHtml(getDisplayName(s))}</td>
                <td>${s.max_level}</td>
                <td>${this.formatTime(s.total_time_ms)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch {
      this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.5'>Could not load leaderboard</p>";
    }
  }

  private async toggleLeaderboard(level: number) {
    if (this.leaderboardPanel.style.display === "block") {
      this.leaderboardPanel.style.display = "none";
      return;
    }

    this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.5'>Loading...</p>";
    this.leaderboardPanel.style.display = "block";

    try {
      const scores = await api.getTopScores(level, 20);
      if (scores.length === 0) {
        this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.5'>No scores yet</p>";
        return;
      }
      this.leaderboardPanel.innerHTML = `
        <table>
          <thead><tr><th>#</th><th>Player</th><th>Time</th></tr></thead>
          <tbody>
            ${scores.map((s: ScoreEntry) => `
              <tr>
                <td>${s.rank}</td>
                <td>${this.escapeHtml(getDisplayName(s))}</td>
                <td>${this.formatTime(s.time_ms)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch {
      this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.5'>Could not load leaderboard</p>";
    }
  }

  async showPlayerStats(playerId: number) {
    try {
      const stats = await api.getPlayerStats(playerId);
      this.statsPanel.innerHTML = `
        Runs: ${stats.total_runs} &middot;
        Boxes: ${stats.total_boxes_broken} &middot;
        Power-ups: ${stats.total_power_ups} &middot;
        Levels: ${stats.levels_completed}
      `;
      this.statsPanel.style.display = "block";
    } catch {
      // Silently fail
    }
  }

  private escapeHtml(s: string): string {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  showLevelSelect(levelCount: number, currentIndex: number) {
    const items = Array.from({ length: levelCount }, (_, i) => {
      const isCurrent = i === currentIndex;
      return `<button class="level-select-btn${isCurrent ? " current" : ""}" data-level-index="${i}" style="
        display:block;width:100%;padding:8px 14px;margin:4px 0;
        background:${isCurrent ? "rgba(68,136,204,0.3)" : "rgba(255,255,255,0.05)"};
        border:1px solid ${isCurrent ? "rgba(68,136,204,0.6)" : "rgba(255,255,255,0.1)"};
        border-radius:6px;color:#ccc;font-size:14px;cursor:pointer;text-align:left;
        font-family:inherit;
      ">Level ${i + 1}</button>`;
    }).join("");

    this.levelSelectEl.innerHTML = `
      <div style="color:#aaa;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Select Level</div>
      ${items}
    `;
    this.levelSelectEl.style.display = "block";

    this.levelSelectEl.onclick = (e) => {
      const btn = (e.target as HTMLElement).closest("[data-level-index]") as HTMLElement | null;
      if (btn) {
        const idx = parseInt(btn.dataset.levelIndex!);
        this.hideLevelSelect();
        this.onLevelSelect?.(idx);
      }
    };
  }

  hideLevelSelect() {
    this.levelSelectEl.style.display = "none";
  }

  get isLevelSelectVisible(): boolean {
    return this.levelSelectEl.style.display !== "none";
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  hideControlsHint() {
    this.controlsHint.style.opacity = "0";
    this.controlsHint.style.transition = "opacity 2s";
  }
}
