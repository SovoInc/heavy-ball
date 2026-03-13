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

  private elapsedMs = 0;
  private running = false;

  onRestart?: () => void;
  onStart?: () => void;
  onNextLevel?: () => void;
  onLevelSelect?: (index: number) => void;

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

    this.restartBtn.addEventListener("click", () => this.onRestart?.());
    this.overlayBtns.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.id === "btn-start") this.onStart?.();
      if (target.id === "btn-next") this.onNextLevel?.();
      if (target.id === "btn-replay") this.onRestart?.();
      if (target.id === "btn-play-again") this.onLevelSelect?.(0);
    });
  }

  setLevel(name: string) {
    this.levelEl.textContent = name;
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

  private formatTime(ms: number): string {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = Math.floor(totalSec % 60);
    const tenth = Math.floor((totalSec * 10) % 10);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${tenth}`;
  }

  showStartScreen() {
    this.overlayH1.textContent = "Heavy Ball";
    this.overlayP.textContent = "Guide the ball to the finish";
    this.overlayBtns.innerHTML = `<button class="overlay-btn" id="btn-start">Start</button>`;
    this.overlayTime.style.display = "none";
    this.overlay.classList.remove("hidden");
  }

  showLevelComplete(timeMs: number, isLastLevel: boolean) {
    this.overlayH1.textContent = "Level Complete!";
    this.overlayP.textContent = "";
    this.overlayTime.style.display = "block";
    this.overlayTime.textContent = `Time: ${this.formatTime(timeMs)}`;

    if (isLastLevel) {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn" id="btn-replay">Play Again</button>
      `;
    } else {
      this.overlayBtns.innerHTML = `
        <button class="overlay-btn" id="btn-next">Next Level</button>
        <button class="overlay-btn secondary" id="btn-replay">Replay</button>
      `;
    }

    this.overlay.classList.remove("hidden");
  }

  showAllComplete(timeMs: number) {
    this.overlayH1.textContent = "You Win!";
    this.overlayP.textContent = "All levels complete";
    this.overlayTime.style.display = "block";
    this.overlayTime.textContent = `Final time: ${this.formatTime(timeMs)}`;
    this.overlayBtns.innerHTML = `
      <button class="overlay-btn" id="btn-play-again">Play Again</button>
    `;
    this.overlay.classList.remove("hidden");
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  hideControlsHint() {
    this.controlsHint.style.opacity = "0";
    this.controlsHint.style.transition = "opacity 2s";
  }
}
