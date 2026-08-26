import Phaser from "../engine.js";
import { keys, consume } from "../keys.js";
import { setLaunchVisible } from "../ui.js";

const DISPLAY = "Orbitron, sans-serif";
const BODY = "Rajdhani, sans-serif";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.starting = false;
    setLaunchVisible(true);

    this.drawAtmosphere(w, h);
    this.drawWedgeSilhouette(w, h);
    this.drawBrand(w, h);
    this.drawCue(w, h);

    this.input.on("pointerup", () => this.startGame());
    this.input.keyboard?.on("keydown-ENTER", () => this.startGame());
  }

  update(_time, delta) {
    if (consume("enter")) this.startGame();
    this.driftStars?.(delta);
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    keys.enter = false;
    keys.space = false;
    setLaunchVisible(false);
    this.scene.start("BriefingScene");
  }

  drawAtmosphere(w, h) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x04101c, 0x04101c, 0x02040a, 0x0a1628, 1);
    bg.fillRect(0, 0, w, h);

    // Soft nebula wash behind the brand.
    const haze = this.add.graphics().setAlpha(0.55);
    haze.fillStyle(0x0e7490, 0.18);
    haze.fillEllipse(w * 0.72, h * 0.38, w * 0.9, h * 0.55);
    haze.fillStyle(0xf59e0b, 0.08);
    haze.fillEllipse(w * 0.22, h * 0.72, w * 0.55, h * 0.4);

    this.stars = [];
    for (let i = 0; i < 90; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.FloatBetween(0.5, 1.8),
        0xe2e8f0,
        Phaser.Math.FloatBetween(0.25, 0.9),
      );
      star.setData("drift", Phaser.Math.FloatBetween(4, 18));
      this.stars.push(star);
    }

    this.driftStars = (delta) => {
      const dt = delta / 1000;
      for (const star of this.stars) {
        star.x -= star.getData("drift") * dt;
        if (star.x < -2) {
          star.x = w + 2;
          star.y = Phaser.Math.Between(0, h);
        }
      }
    };

    // Horizon scan line.
    const scan = this.add.rectangle(w / 2, h * 0.62, w, 1, 0x5eead4, 0.18);
    this.tweens.add({
      targets: scan,
      alpha: { from: 0.08, to: 0.28 },
      yoyo: true,
      duration: 2200,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  drawWedgeSilhouette(w, h) {
    // Distant Leviathan tip-first silhouette — atmosphere, not a HUD card.
    const g = this.add.graphics().setAlpha(0.55);
    const tipX = w * 0.08;
    const sternX = w * 1.05;
    const cy = h * 0.58;
    const half = h * 0.34;

    g.fillStyle(0x0b1a28, 0.95);
    g.fillTriangle(tipX, cy, sternX, cy - half, sternX, cy + half);
    g.lineStyle(2, 0x5eead4, 0.22);
    g.strokeTriangle(tipX, cy, sternX, cy - half, sternX, cy + half);
    g.lineStyle(1, 0xf59e0b, 0.2);
    for (let i = 1; i <= 5; i += 1) {
      const t = i / 6;
      const x = tipX + (sternX - tipX) * t;
      const hh = half * t;
      g.lineBetween(x, cy - hh, x, cy + hh);
    }

    this.tweens.add({
      targets: g,
      alpha: { from: 0.4, to: 0.62 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  drawBrand(w, h) {
    const brandY = h * 0.28;

    this.add
      .text(w / 2, brandY - 42, "SECTOR DEFENSE PROTOCOL", {
        fontFamily: BODY,
        fontSize: "15px",
        color: "#5eead4",
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0.85);

    const title = this.add
      .text(w / 2, brandY + 18, "STARLANCE", {
        fontFamily: DISPLAY,
        fontSize: "72px",
        fontStyle: "800",
        color: "#f8fafc",
        letterSpacing: 10,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#2dd4bf", 18, true, true);

    // Accent underline under the brand.
    const rule = this.add.rectangle(w / 2, brandY + 64, 0, 2, 0xf59e0b, 0.9);
    this.tweens.add({
      targets: rule,
      width: 220,
      duration: 900,
      ease: "Cubic.easeOut",
      delay: 180,
    });

    this.add
      .text(w / 2, brandY + 96, "An homage to the Dreadnaught Factor", {
        fontFamily: BODY,
        fontSize: "22px",
        color: "#94a3b8",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 0.94, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 700,
      ease: "Cubic.easeOut",
    });
  }

  drawCue(w, h) {
    const hint = this.add
      .text(w / 2, h * 0.78, "ENTER  ·  ENGAGE", {
        fontFamily: DISPLAY,
        fontSize: "16px",
        color: "#ccfbf1",
        letterSpacing: 5,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: { from: 0.35, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.add
      .text(w / 2, h * 0.86, "Z laser   X bomb   arrows speed & align", {
        fontFamily: BODY,
        fontSize: "15px",
        color: "#64748b",
        letterSpacing: 2,
      })
      .setOrigin(0.5);
  }
}
