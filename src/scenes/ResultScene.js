import Phaser from "../engine.js";
import { consume } from "../keys.js";
import { setLaunchVisible } from "../ui.js";

const COPY = {
  destroyed: {
    title: "HULL CRITICAL",
    body: "Every energy vent is gone. The dreadnaught tears itself apart.",
  },
  neutralized: {
    title: "THREAT NEUTRALIZED",
    body: "It reached the stargate, but every silo is cold. The planet holds.",
  },
  planetLost: {
    title: "GATE BREACHED",
    body: "The dreadnaught closed the distance. The stargate is lost.",
  },
  gameOver: {
    title: "INTERCEPTOR LOST",
    body: "Your hull is gone. The dreadnaught continues its run.",
  },
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    this.result = data ?? { outcome: "gameOver", score: 0, pass: 1 };
    this.armed = false;
    this.leaving = false;
    setLaunchVisible(true);
  }

  create() {
    const { width, height } = this.scale;
    const info = COPY[this.result.outcome] ?? COPY.gameOver;
    const win = this.result.outcome === "destroyed" || this.result.outcome === "neutralized";

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070c);
    this.add
      .text(width / 2, height * 0.28, info.title, {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "28px",
        color: win ? "#67e8f9" : "#fb7185",
        align: "center",
        wordWrap: { width: width * 0.86 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.38, info.body, {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: "18px",
        color: "#94a3b8",
        align: "center",
        wordWrap: { width: width * 0.82 },
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.5,
        `Score  ${this.result.score}     Passes  ${this.result.pass}`,
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#e2e8f0",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.62, "ENTER  ·  fly another pass", {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: "16px",
        color: "#38bdf8",
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.returnToMenu());

    // Ignore fire keys still held from the final strike.
    this.time.delayedCall(800, () => {
      this.armed = true;
      keys.z = false;
      keys.x = false;
      keys.space = false;
      keys.shift = false;
      keys.enter = false;
    });
  }

  update() {
    if (!this.armed) return;
    if (consume("enter")) this.returnToMenu();
  }

  returnToMenu() {
    if (!this.armed || this.leaving) return;
    this.leaving = true;
    keys.enter = false;
    keys.space = false;
    keys.z = false;
    this.scene.start("MenuScene");
  }
}
