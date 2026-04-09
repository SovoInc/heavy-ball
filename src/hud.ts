import { PowerUpType } from "./powerups/PowerUpType";
import { CONFIG } from "./config";
import { api, type ScoreEntry, type LeaderboardEntry, type AchievementEntry, getDisplayName } from "./api";
import { MIDNIGHT_NETWORKS, DEFAULT_NETWORK } from "./midnight";

const ACHIEVEMENT_DEFS: Record<string, { name: string; desc: string; icon: string }> = {
  first_finish:   { name: "First Finish",    desc: "Complete any level",                  icon: "\u{1F3C1}" },
  speed_demon:    { name: "Speed Demon",     desc: "Complete a level under 30 seconds",   icon: "\u{26A1}" },
  box_smasher:    { name: "Box Smasher",     desc: "Break 50 boxes total",                icon: "\u{1F4E6}" },
  power_collector:{ name: "Power Collector",  desc: "Collect 25 power-ups total",          icon: "\u{2B50}" },
  completionist:  { name: "Completionist",   desc: "Complete all 100 levels",             icon: "\u{1F3C6}" },
  no_fall:        { name: "No Fall",          desc: "Complete a level without falling",    icon: "\u{1F3AF}" },
  speedster:      { name: "Speedster",        desc: "Use 10 speed boosts total",           icon: "\u{1F680}" },
  fire_maxed:     { name: "Overheated",       desc: "Reach maximum fire buildup",          icon: "\u{1F525}" },
  ice_maxed:      { name: "Frozen Solid",     desc: "Get completely frozen by ice",        icon: "\u{2744}\u{FE0F}" },
};

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
  private overlayContent: HTMLElement;
  private overlayH1: HTMLElement;
  private overlaySubtitle: HTMLElement;
  private overlayBtns: HTMLElement;
  private overlayTime: HTMLElement;
  private controlsHint: HTMLElement;
  private powerupsEl: HTMLElement;
  private toastEl: HTMLElement;
  private leaderboardPanel: HTMLElement;
  private statsPanel: HTMLElement;
  private levelSelectEl: HTMLElement;
  private fireBarContainer: HTMLElement;
  private fireBarFill: HTMLElement;
  private iceBarContainer: HTMLElement;
  private iceBarFill: HTMLElement;
  private fireOverlay: HTMLElement;
  private iceOverlay: HTMLElement;
  private achievementsPanel: HTMLElement;
  private achievementToast: HTMLElement;
  private achievementToastIcon: HTMLElement;
  private achievementToastName: HTMLElement;
  private achievementToastTimeout: ReturnType<typeof setTimeout> | null = null;

  private elapsedMs = 0;
  private running = false;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentLevelIndex = 0;

  onGiveUp?: () => void;
  onStart?: () => void;
  onNextLevel?: () => void;
  onLevelSelect?: (index: number) => void;
  onWalletConnect?: (networkId: string) => void;
  onWalletDisconnect?: () => void;
  onDemo?: () => void;

  constructor() {
    this.levelEl = document.getElementById("hud-level")!;
    this.timerEl = document.getElementById("hud-timer")!;
    this.restartBtn = document.getElementById("hud-restart")!;
    this.overlay = document.getElementById("overlay")!;
    this.overlayContent = document.getElementById("overlay-content")!;
    this.overlayH1 = this.overlay.querySelector("h1")!;
    this.overlaySubtitle = document.getElementById("overlay-subtitle")!;
    this.overlayBtns = document.getElementById("overlay-buttons")!;
    this.overlayTime = document.getElementById("overlay-time")!;
    this.controlsHint = document.getElementById("controls-hint")!;
    this.powerupsEl = document.getElementById("hud-powerups")!;
    this.toastEl = document.getElementById("hud-toast")!;
    this.leaderboardPanel = document.getElementById("leaderboard-panel")!;
    this.statsPanel = document.getElementById("stats-panel")!;
    this.fireBarContainer = document.getElementById("fire-bar-container")!;
    this.fireBarFill = document.getElementById("fire-bar-fill")!;
    this.iceBarContainer = document.getElementById("ice-bar-container")!;
    this.iceBarFill = document.getElementById("ice-bar-fill")!;
    this.fireOverlay = document.getElementById("fire-overlay")!;
    this.iceOverlay = document.getElementById("ice-overlay")!;
    this.achievementsPanel = document.getElementById("achievements-panel")!;
    this.achievementToast = document.getElementById("achievement-toast")!;
    this.achievementToastIcon = this.achievementToast.querySelector(".toast-icon")!;
    this.achievementToastName = this.achievementToast.querySelector(".toast-name")!;

    // Create level select popup
    this.levelSelectEl = document.createElement("div");
    this.levelSelectEl.id = "level-select";
    this.levelSelectEl.style.cssText = `
      display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      background:rgba(10,10,20,0.95);border:1px solid rgba(255,255,255,0.1);
      border-radius:16px;padding:20px;z-index:1000;max-height:80vh;overflow-y:auto;
      min-width:240px;backdrop-filter:blur(20px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
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
      if (target.id === "btn-wallet-connect") {
        const select = document.getElementById("network-select") as HTMLSelectElement | null;
        this.onWalletConnect?.(select?.value ?? DEFAULT_NETWORK);
      }
      if (target.id === "btn-wallet-disconnect") {
        this.onWalletDisconnect?.();
      }
      if (target.id === "btn-demo") {
        this.onDemo?.();
      }
      if (target.id === "btn-leaderboard") {
        this.toggleLeaderboard(parseInt(target.dataset.level ?? "1"));
      }
      if (target.id === "btn-highscores") {
        this.toggleGlobalLeaderboard();
      }
      if (target.id === "btn-leaderboard-back") {
        this.hideLeaderboardView();
      }
      if (target.id === "btn-achievements") {
        this.toggleAchievements(parseInt(target.dataset.playerId ?? "0"));
      }
      if (target.id === "btn-achievements-back") {
        this.hideAchievementsView();
      }
    });
  }

  private resetOverlay() {
    this.overlayTime.style.display = "none";
    this.leaderboardPanel.style.display = "none";
    this.achievementsPanel.style.display = "none";
    this.statsPanel.style.display = "none";
    // Clean up dynamic elements (badges, errors)
    this.overlayContent.querySelectorAll(".player-badge, .wallet-error").forEach(el => el.remove());
    // Re-trigger entry animation
    this.overlayContent.style.animation = "none";
    void this.overlayContent.offsetHeight;
    this.overlayContent.style.animation = "";
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

  updateElementalBuildup(fire: number, ice: number) {
    const fireVisible = fire > 0.01;
    const iceVisible = ice > 0.01;

    this.fireBarContainer.classList.toggle("visible", fireVisible);
    this.iceBarContainer.classList.toggle("visible", iceVisible);

    if (fireVisible) {
      this.fireBarFill.style.width = `${fire * 100}%`;
    }
    if (iceVisible) {
      this.iceBarFill.style.width = `${ice * 100}%`;
    }

    // Screen vignette overlays
    this.fireOverlay.style.opacity = fire > 0.1 ? String(fire * 0.8) : "0";
    this.iceOverlay.style.opacity = ice > 0.1 ? String(ice * 0.8) : "0";
  }

  showWalletLogin() {
    this.resetOverlay();
    this.overlayH1.textContent = "Heavy Ball";
    this.overlaySubtitle.textContent = "Connect your wallet to play";
    const networkOptions = MIDNIGHT_NETWORKS.map(n =>
      `<option value="${n.id}"${n.id === DEFAULT_NETWORK ? " selected" : ""}${!n.enabled ? " disabled" : ""}>${n.label}${!n.enabled ? " (coming soon)" : ""}</option>`
    ).join("");
    this.overlayBtns.innerHTML = `
      <div class="network-selector">
        <label for="network-select">Network</label>
        <select id="network-select">${networkOptions}</select>
      </div>
      <button class="overlay-btn primary" id="btn-wallet-connect">Connect Wallet</button>
      <button class="overlay-btn secondary" id="btn-demo">Demo</button>
    `;
    this.overlay.classList.remove("hidden");
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
    let errorEl = document.getElementById("wallet-error");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.id = "wallet-error";
      errorEl.className = "wallet-error";
      this.overlayBtns.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  showStartScreen(continueLevel = 0, playerIdentifier?: string, playerId = 0) {
    this.resetOverlay();
    this.overlayH1.textContent = "Heavy Ball";

    const badge = playerIdentifier
      ? `<div class="player-badge"><span class="dot"></span>${this.escapeHtml(playerIdentifier)}</div>`
      : "";

    const subtitle = continueLevel > 0
      ? `Level ${continueLevel} completed`
      : "Guide the ball to the finish";

    this.overlaySubtitle.innerHTML = subtitle;

    // Insert badge before subtitle if player is logged in
    if (badge) {
      this.overlaySubtitle.insertAdjacentHTML("beforebegin", badge);
    }

    const logoutBtn = playerIdentifier
      ? `<button class="overlay-btn danger" id="btn-wallet-disconnect">Sign out</button>`
      : "";

    const achievementsBtn = playerId > 0
      ? `<button class="overlay-btn secondary" id="btn-achievements" data-player-id="${playerId}">Achievements</button>`
      : "";

    if (continueLevel > 0) {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn primary" id="btn-continue" data-level="${continueLevel}">Continue &mdash; Level ${continueLevel + 1}</button>
        <button class="overlay-btn secondary" id="btn-start">New Game</button>
        <button class="overlay-btn secondary" id="btn-highscores">Leaderboard</button>
        ${achievementsBtn}
        ${logoutBtn}
      `;
    } else {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn primary" id="btn-start">Play</button>
        <button class="overlay-btn secondary" id="btn-highscores">Leaderboard</button>
        ${achievementsBtn}
        ${logoutBtn}
      `;
    }
    this.overlay.classList.remove("hidden");
  }

  showLevelComplete(timeMs: number, isLastLevel: boolean, levelNumber?: number) {
    this.resetOverlay();
    this.overlayH1.textContent = "Level Complete";
    this.overlaySubtitle.textContent = "";
    this.overlayTime.style.display = "block";
    this.overlayTime.textContent = this.formatTime(timeMs);

    const leaderboardBtn = levelNumber
      ? `<button class="overlay-btn secondary" id="btn-leaderboard" data-level="${levelNumber}">Leaderboard</button>`
      : "";

    if (isLastLevel) {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn primary" id="btn-replay">Play Again</button>
        ${leaderboardBtn}
      `;
    } else {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn primary" id="btn-next">Next Level</button>
        <button class="overlay-btn secondary" id="btn-replay">Replay</button>
        ${leaderboardBtn}
      `;
    }
    this.overlay.classList.remove("hidden");
  }

  showAllComplete(timeMs: number) {
    this.resetOverlay();
    this.overlayH1.textContent = "You Win!";
    this.overlaySubtitle.textContent = "All levels complete";
    this.overlayTime.style.display = "block";
    this.overlayTime.textContent = this.formatTime(timeMs);
    this.overlayBtns.innerHTML = `
      <button class="overlay-btn primary" id="btn-play-again">Play Again</button>
    `;
    this.overlay.classList.remove("hidden");
  }

  private savedMenuState: { buttons: string; title: string; subtitle: string; badges: string } | null = null;

  private showLeaderboardView() {
    // Save current menu state
    const badges: string[] = [];
    this.overlayContent.querySelectorAll(".player-badge").forEach(el => {
      badges.push(el.outerHTML);
      el.remove();
    });
    this.savedMenuState = {
      buttons: this.overlayBtns.innerHTML,
      title: this.overlayH1.textContent ?? "",
      subtitle: this.overlaySubtitle.innerHTML,
      badges: badges.join(""),
    };
    this.overlayBtns.innerHTML = `
      <button class="overlay-btn secondary" id="btn-leaderboard-back">Back</button>
    `;
    this.overlayH1.textContent = "Leaderboard";
    this.overlaySubtitle.textContent = "";
    this.leaderboardPanel.style.display = "block";
  }

  private hideLeaderboardView() {
    this.leaderboardPanel.style.display = "none";
    if (this.savedMenuState) {
      this.overlayH1.textContent = this.savedMenuState.title;
      this.overlaySubtitle.innerHTML = this.savedMenuState.subtitle;
      this.overlayBtns.innerHTML = this.savedMenuState.buttons;
      if (this.savedMenuState.badges) {
        this.overlaySubtitle.insertAdjacentHTML("beforebegin", this.savedMenuState.badges);
      }
      this.savedMenuState = null;
    }
  }

  private showAchievementsView() {
    const badges: string[] = [];
    this.overlayContent.querySelectorAll(".player-badge").forEach(el => {
      badges.push(el.outerHTML);
      el.remove();
    });
    this.savedMenuState = {
      buttons: this.overlayBtns.innerHTML,
      title: this.overlayH1.textContent ?? "",
      subtitle: this.overlaySubtitle.innerHTML,
      badges: badges.join(""),
    };
    this.overlayBtns.innerHTML = `
      <button class="overlay-btn secondary" id="btn-achievements-back">Back</button>
    `;
    this.overlayH1.textContent = "Achievements";
    this.overlaySubtitle.textContent = "";
    this.achievementsPanel.style.display = "block";
  }

  private hideAchievementsView() {
    this.achievementsPanel.style.display = "none";
    if (this.savedMenuState) {
      this.overlayH1.textContent = this.savedMenuState.title;
      this.overlaySubtitle.innerHTML = this.savedMenuState.subtitle;
      this.overlayBtns.innerHTML = this.savedMenuState.buttons;
      if (this.savedMenuState.badges) {
        this.overlaySubtitle.insertAdjacentHTML("beforebegin", this.savedMenuState.badges);
      }
      this.savedMenuState = null;
    }
  }

  private async toggleAchievements(playerId: number) {
    if (this.achievementsPanel.style.display === "block") {
      this.hideAchievementsView();
      return;
    }

    this.achievementsPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>Loading...</p>";
    this.showAchievementsView();

    let unlocked: Set<string>;
    try {
      const entries = await api.getPlayerAchievements(playerId);
      unlocked = new Set(entries.map((e: AchievementEntry) => e.achievement_key));
    } catch {
      this.achievementsPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>Could not load</p>";
      return;
    }

    const allKeys = Object.keys(ACHIEVEMENT_DEFS);
    this.achievementsPanel.innerHTML = allKeys.map(key => {
      const def = ACHIEVEMENT_DEFS[key];
      const isUnlocked = unlocked.has(key);
      return `
        <div class="achievement-item ${isUnlocked ? "unlocked" : "locked"}">
          <div class="achievement-icon">${def.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${this.escapeHtml(def.name)}</div>
            <div class="achievement-desc">${this.escapeHtml(def.desc)}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  showAchievementUnlocked(keys: string[], displayNames: string[]) {
    const queue = keys.map((key, i) => ({
      icon: ACHIEVEMENT_DEFS[key]?.icon ?? "\u{1F3C6}",
      name: displayNames[i] ?? ACHIEVEMENT_DEFS[key]?.name ?? key,
    }));
    let index = 0;
    const showNext = () => {
      if (index >= queue.length) return;
      const item = queue[index++];
      this.achievementToastIcon.textContent = item.icon;
      this.achievementToastName.textContent = item.name;
      this.achievementToast.classList.add("show");
      if (this.achievementToastTimeout) clearTimeout(this.achievementToastTimeout);
      this.achievementToastTimeout = setTimeout(() => {
        this.achievementToast.classList.remove("show");
        setTimeout(showNext, 400);
      }, 3000);
    };
    showNext();
  }

  private async toggleGlobalLeaderboard() {
    if (this.leaderboardPanel.style.display === "block") {
      this.hideLeaderboardView();
      return;
    }

    this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>Loading...</p>";
    this.showLeaderboardView();

    try {
      const entries = await api.getLeaderboard(20);
      if (entries.length === 0) {
        this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>No scores yet</p>";
        return;
      }
      this.leaderboardPanel.innerHTML = `
        <table>
          <thead><tr><th>#</th><th>Player</th><th>Level</th><th>Time</th></tr></thead>
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
      this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>Could not load</p>";
    }
  }

  private async toggleLeaderboard(level: number) {
    if (this.leaderboardPanel.style.display === "block") {
      this.hideLeaderboardView();
      return;
    }

    this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>Loading...</p>";
    this.showLeaderboardView();

    try {
      const scores = await api.getTopScores(level, 20);
      if (scores.length === 0) {
        this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>No scores yet</p>";
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
      this.leaderboardPanel.innerHTML = "<p style='text-align:center;opacity:0.4;padding:20px;font-size:13px'>Could not load</p>";
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
        display:block;width:100%;padding:10px 14px;margin:3px 0;
        background:${isCurrent ? "rgba(100,136,255,0.15)" : "rgba(255,255,255,0.03)"};
        border:1px solid ${isCurrent ? "rgba(100,136,255,0.3)" : "rgba(255,255,255,0.06)"};
        border-radius:8px;color:rgba(200,210,230,0.8);font-size:13px;cursor:pointer;text-align:left;
        font-family:'Inter',sans-serif;font-weight:500;transition:all 0.15s;
      ">Level ${i + 1}</button>`;
    }).join("");

    this.levelSelectEl.innerHTML = `
      <div style="color:rgba(255,255,255,0.4);font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:12px">Select Level</div>
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
