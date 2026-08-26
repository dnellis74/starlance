import Phaser from "../engine.js";
import { keys, consume } from "../keys.js";
import { setLaunchVisible } from "../ui.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;
    this.starting = false;
    setLaunchVisible(true);

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070c);
    drawStars(this, 70);

    this.add
      .text(width / 2, 86, "THE DREADNAUGHT FACTOR", {
        fontFamily: "Georgia, serif",
        fontSize: "36px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 132, "A modern homage · Cheshire / Activision, 1983", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#64748b",
      })
      .setOrigin(0.5);

    const briefing = [
      "A Leviathan-class dreadnaught is a tip-first wedge too large for one screen.",
      "Approach the bow, then scroll vertically to cover the widening hull.",
      "",
      "DESTROY  — bomb every energy vent and the hull detonates.",
      "NEUTRALIZE — bomb every missile silo so it cannot kill the planet.",
      "If it reaches the stargate with any silo intact, the planet is lost.",
      "",
      "Lasers (Z / SPACE)  ·  cannons, launchers, towers, bridges, missiles",
      "Bombs  (X / SHIFT)  ·  silos, energy vents, engines",
      "Arrows  ·  speed (never reverse) and vertical alignment",
    ].join("\n");

    this.add
      .text(width / 2, 300, briefing, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        color: "#cbd5e1",
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 470, "Use the Launch button, or click the screen / press Enter", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#38bdf8",
      })
      .setOrigin(0.5);

    // Pointer first — if keyboard is missing, create() must not throw before this binds.
    this.input.on("pointerup", () => this.startGame());
    this.input.keyboard?.on("keydown-ENTER", () => this.startGame());
  }

  update() {
    if (consume("enter")) this.startGame();
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    keys.enter = false;
    keys.space = false;
    setLaunchVisible(false);
    this.scene.start("PlayScene");
  }
}

function drawStars(scene, count) {
  for (let i = 0; i < count; i += 1) {
    const x = Phaser.Math.Between(0, scene.scale.width);
    const y = Phaser.Math.Between(0, scene.scale.height);
    const s = Phaser.Math.FloatBetween(0.6, 1.8);
    scene.add.circle(x, y, s, 0xe2e8f0, Phaser.Math.FloatBetween(0.25, 0.85));
  }
}
