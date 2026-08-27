import Phaser from "../engine.js";
import { keys, consume } from "../keys.js";
import { setLaunchVisible } from "../ui.js";

const DISPLAY = "Orbitron, sans-serif";
const BODY = "Rajdhani, sans-serif";

const ORDERS = [
  "An enemy capital ship has broken the lines.",
  "All that stands between it and the home planet",
  "is your lance — sixteen light fighters, one hull each.",
  "",
  "BOMBING PRIORITIES",
  "",
  "• Destroy all BRIDGES to reduce Dreadnaught firing rate by 50 percent.",
  "• Destroy each ENGINE to slow the Dreadnaught's approach velocity.",
  "• SILOS house anti-matter missiles which can detonate the",
  "  Unstable Energy Field. Destroy them.",
  "• In order to destroy a Dreadnaught, bomb all ENERGY VENTS.",
].join("\n");

export class BriefingScene extends Phaser.Scene {
  constructor() {
    super("BriefingScene");
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.leaving = false;
    this.armed = false;
    setLaunchVisible(false);

    this.add.rectangle(w / 2, h / 2, w, h, 0x02040a);
    this.drawStars(w, h);

    const panel = this.add.rectangle(w / 2, h / 2 - 10, w * 0.78, h * 0.72, 0x071018, 0.92);
    panel.setStrokeStyle(1, 0x2dd4bf, 0.35);

    this.add
      .text(w / 2, h * 0.12, "MISSION BRIEFING · TRANSMISSION", {
        fontFamily: DISPLAY,
        fontSize: "13px",
        color: "#5eead4",
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0.9);

    const body = this.add
      .text(w / 2, h / 2 - 4, ORDERS, {
        fontFamily: DISPLAY,
        fontSize: "15px",
        color: "#e2e8f0",
        align: "left",
        lineSpacing: 6,
        wordWrap: { width: w * 0.66 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: body,
      alpha: 1,
      duration: 700,
      ease: "Cubic.easeOut",
    });

    const skip = this.add
      .text(w / 2, h * 0.84, "FIRE  ·  SKIP BRIEFING", {
        fontFamily: BODY,
        fontSize: "16px",
        color: "#94a3b8",
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: skip,
      alpha: { from: 0.4, to: 1 },
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Ignore the click/key that opened this scene from the menu.
    this.time.delayedCall(220, () => {
      this.armed = true;
      keys.z = false;
      keys.space = false;
      keys.enter = false;
      keys.x = false;
    });

    this.input.on("pointerup", () => this.advance());
    this.input.keyboard?.on("keydown-ENTER", () => this.advance());
  }

  update() {
    if (!this.armed) return;
    if (consume("z") || consume("space") || consume("enter") || consume("x")) {
      this.advance();
    }
  }

  advance() {
    if (!this.armed || this.leaving) return;
    this.leaving = true;
    keys.z = false;
    keys.space = false;
    keys.enter = false;
    this.scene.start("PlayScene");
  }

  drawStars(w, h) {
    for (let i = 0; i < 60; i += 1) {
      this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.FloatBetween(0.4, 1.4),
        0xcbd5e1,
        Phaser.Math.FloatBetween(0.2, 0.7),
      );
    }
  }
}
