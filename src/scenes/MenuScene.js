import Phaser from "../engine.js";
import { keys, consume } from "../keys.js";
import { touchControlsEnabled } from "../touchControls.js";
import {
  DIFFICULTIES,
  getDifficultyIndex,
  setDifficultyIndex,
  formatDifficultyLabel,
} from "../difficulty.js";

const DISPLAY = "Orbitron, sans-serif";
const BODY = "Rajdhani, sans-serif";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.starting = false;
    this.selectedIndex = getDifficultyIndex();

    this.drawAtmosphere(w, h);
    this.drawWedgeSilhouette(w, h);
    const brandY = h * 0.22;
    this.drawBrand(w, brandY);
    this.drawDifficulty(w, brandY);
    this.drawCue(w, h);

    this.input.on("pointerup", () => this.startGame());
    this.input.keyboard?.on("keydown-ENTER", () => this.startGame());
  }

  update(_time, delta) {
    if (!this.starting) this.updateDifficultyInput();
    if (consume("enter")) this.startGame();
    this.driftStars?.(delta);
  }

  updateDifficultyInput() {
    if (consume("up") || consume("left")) {
      this.selectedIndex -= 1;
      this.refreshDifficultySelection();
    } else if (consume("down") || consume("right")) {
      this.selectedIndex += 1;
      this.refreshDifficultySelection();
    }
  }

  refreshDifficultySelection() {
    setDifficultyIndex(this.selectedIndex);
    this.selectedIndex = getDifficultyIndex();

    for (let i = 0; i < this.difficultyLabels.length; i += 1) {
      const { label } = this.difficultyLabels[i];
      const selected = i === this.selectedIndex;
      this.tweens.killTweensOf(label);

      if (selected) {
        label.setColor("#ccfbf1");
        label.setScale(1);
        this.tweens.add({
          targets: label,
          alpha: { from: 0.45, to: 1 },
          scale: { from: 0.96, to: 1.04 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      } else {
        label.setColor("#64748b");
        label.setAlpha(0.5);
        label.setScale(1);
      }
    }
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    keys.enter = false;
    keys.space = false;
    setDifficultyIndex(this.selectedIndex);
    if (this.cache.audio.exists("sfx-engage")) {
      this.sound.play("sfx-engage", { volume: 0.6 });
    }
    this.scene.start("BriefingScene");
  }

  drawAtmosphere(w, h) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x04101c, 0x04101c, 0x02040a, 0x0a1628, 1);
    bg.fillRect(0, 0, w, h);

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
        star.y += star.getData("drift") * dt;
        if (star.y > h + 2) {
          star.y = -2;
          star.x = Phaser.Math.Between(0, w);
        }
      }
    };

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
    const g = this.add.graphics().setAlpha(0.55);
    const tipY = h * 0.7;
    const sternY = h * 0.34;
    const cx = w * 0.5;
    const half = w * 0.38;

    g.fillStyle(0x0b1a28, 0.95);
    g.fillTriangle(cx, tipY, cx - half, sternY, cx + half, sternY);
    g.lineStyle(2, 0x5eead4, 0.22);
    g.strokeTriangle(cx, tipY, cx - half, sternY, cx + half, sternY);
    g.lineStyle(1, 0xf59e0b, 0.2);
    for (let i = 1; i <= 5; i += 1) {
      const t = i / 6;
      const y = tipY + (sternY - tipY) * t;
      const hh = half * t;
      g.lineBetween(cx - hh, y, cx + hh, y);
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

  drawBrand(w, brandY) {
    this.add
      .text(w / 2, brandY - 36, "SECTOR DEFENSE PROTOCOL", {
        fontFamily: BODY,
        fontSize: "13px",
        color: "#5eead4",
        letterSpacing: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0.85);

    const title = this.add
      .text(w / 2, brandY + 14, "STARLANCE", {
        fontFamily: DISPLAY,
        fontSize: "52px",
        fontStyle: "800",
        color: "#f8fafc",
        letterSpacing: 8,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#2dd4bf", 18, true, true);

    const rule = this.add.rectangle(w / 2, brandY + 52, 0, 2, 0xf59e0b, 0.9);
    this.tweens.add({
      targets: rule,
      width: 180,
      duration: 900,
      ease: "Cubic.easeOut",
      delay: 180,
    });

    this.add
      .text(w / 2, brandY + 82, "An homage to the Dreadnaught Factor", {
        fontFamily: BODY,
        fontSize: "18px",
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

  drawDifficulty(w, brandY) {
    const baseY = brandY + 118;

    this.add
      .text(w / 2, baseY, "DIFFICULTY", {
        fontFamily: BODY,
        fontSize: "12px",
        color: "#5eead4",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    this.difficultyLabels = [];
    const startY = baseY + 30;
    const lineHeight = 28;

    DIFFICULTIES.forEach((level, index) => {
      const label = this.add
        .text(w / 2, startY + index * lineHeight, formatDifficultyLabel(level), {
          fontFamily: DISPLAY,
          fontSize: "15px",
          color: "#64748b",
          letterSpacing: 2,
        })
        .setOrigin(0.5)
        .setAlpha(0.5);
      this.difficultyLabels.push({ level, label });
    });

    this.refreshDifficultySelection();
  }

  drawCue(w, h) {
    const hint = this.add
      .text(w / 2, h * 0.8, "ENTER  ·  BEGIN", {
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
      .text(
        w / 2,
        h * 0.86,
        touchControlsEnabled()
          ? "↑↓ difficulty   drag to fly + laser   BOMB / X"
          : "↑↓ difficulty   ↑ climb   ←→ align   Z laser   X bomb",
        {
          fontFamily: BODY,
          fontSize: "13px",
          color: "#64748b",
          letterSpacing: 1,
        },
      )
      .setOrigin(0.5);
  }
}
