import Phaser from "../engine.js";
import { consume } from "../keys.js";
import { setLaunchVisible } from "../ui.js";

const COPY = {
  destroyed: {
    title: "DREADNAUGHT DESTROYED",
    body: "Every energy vent is gone. The hull goes critical.",
  },
  neutralized: {
    title: "DREADNAUGHT NEUTRALIZED",
    body: "It reached the stargate, but every silo is cold. The planet holds.",
  },
  planetLost: {
    title: "PLANET DESTROYED",
    body: "The dreadnaught reached the stargate with silos still armed.",
  },
  gameOver: {
    title: "INTERCEPTOR LOST",
    body: "No lives remain. The dreadnaught continues its run.",
  },
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    this.result = data ?? { outcome: "gameOver", score: 0, pass: 1 };
    setLaunchVisible(true);
  }

  create() {
    const { width, height } = this.scale;
    const info = COPY[this.result.outcome] ?? COPY.gameOver;
    const win = this.result.outcome === "destroyed" || this.result.outcome === "neutralized";

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070c);
    this.add
      .text(width / 2, 160, info.title, {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: win ? "#67e8f9" : "#fb7185",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 220, info.body, {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#94a3b8",
        align: "center",
        wordWrap: { width: 640 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 300, `Score  ${this.result.score}     Passes  ${this.result.pass}`, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 420, "ENTER  ·  fly another pass", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#38bdf8",
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.scene.start("MenuScene"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("MenuScene"));
  }

  update() {
    if (consume("enter") || consume("space")) this.scene.start("MenuScene");
  }
}
