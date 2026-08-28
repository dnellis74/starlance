import Phaser from "../engine.js";
import { keys, consume } from "../keys.js";
import { MAX_PILOTS, PILOTS, formatPilotStatus } from "../data/pilots.js";
import { getScoreBreakdown, formatScoreValue } from "../scoring.js";

const COPY = {
  destroyed: {
    title: "EARTH SAVED",
    body: "Every energy vent is gone. The dreadnaught explodes — Earth is saved.",
  },
  neutralized: {
    title: "Threat Neutralized",
    body: "It reached the stargate, but every silo is cold. The Earth holds.",
  },
  planetLost: {
    title: "EARTH LOST",
    body: "The dreadnaught closed the distance. The Earth is lost. The surviving pilots form a resistance.",
  },
  gameOver: {
    title: "EARTH LOST",
    body: `All ${MAX_PILOTS} pilots of the lance are gone. The dreadnaught continues its run. The Earth is lost.`,
  },
};

function formatLanceReport(pilotDamage, pilotStatus) {
  const lines = ["LANCE REPORT", ""];
  for (const pilot of PILOTS) {
    const dmg = pilotDamage?.[pilot.id] ?? 0;
    const status = formatPilotStatus(pilotStatus?.[pilot.id] ?? "alive");
    lines.push(
      `F${String(pilot.id).padStart(2, "0")}  ${pilot.callsign.padEnd(9)} ${status.padEnd(8)} ${String(dmg).padStart(6)}`,
    );
  }
  return lines.join("\n");
}

function drawScoreTable(scene, centerX, startY, breakdown) {
  const tableWidth = 300;
  const leftX = centerX - tableWidth / 2;
  const rightX = centerX + tableWidth / 2;
  const lineHeight = 16;
  const font = { fontFamily: "monospace", fontSize: "11px", color: "#e2e8f0" };

  let y = startY;

  scene.add
    .text(centerX, y, breakdown.title, {
      ...font,
      fontFamily: "Orbitron, sans-serif",
      fontSize: "12px",
      color: "#5eead4",
      letterSpacing: 3,
    })
    .setOrigin(0.5, 0);
  y += lineHeight + 6;

  if (breakdown.message) {
    scene.add
      .text(centerX, y, breakdown.message, {
        ...font,
        color: "#94a3b8",
        wordWrap: { width: tableWidth },
        align: "center",
      })
      .setOrigin(0.5, 0);
    return;
  }

  for (const row of breakdown.rows) {
    if ("spacer" in row) {
      y += 8;
      continue;
    }

    const valueColor = row.total ? "#67e8f9" : "#e2e8f0";
    scene.add
      .text(leftX, y, row.label, { ...font, color: row.total ? "#cbd5e1" : "#94a3b8" })
      .setOrigin(0, 0);
    scene.add
      .text(rightX, y, formatScoreValue(row.value, { total: row.total }), {
        ...font,
        color: valueColor,
        align: "right",
      })
      .setOrigin(1, 0);
    y += lineHeight;
  }
}

function startRainbowPulse(scene, text) {
  const state = { hue: 0 };
  scene.tweens.add({
    targets: state,
    hue: 360,
    duration: 2400,
    repeat: -1,
    onUpdate: () => {
      const rgb = Phaser.Display.Color.HSVToRGB(state.hue / 360, 1, 1);
      text.setColor(`#${rgb.color.toString(16).padStart(6, "0")}`);
    },
  });
  scene.tweens.add({
    targets: text,
    scale: { from: 0.96, to: 1.05 },
    alpha: { from: 0.82, to: 1 },
    duration: 850,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    this.result = data ?? {
      outcome: "gameOver",
      damage: 0,
      pass: 1,
      fighter: 1,
      pilotDamage: {},
      pilotStatus: {},
    };
    this.armed = false;
    this.leaving = false;
  }

  create() {
    const { width, height } = this.scale;
    const info = COPY[this.result.outcome] ?? COPY.gameOver;
    const win = this.result.outcome === "destroyed" || this.result.outcome === "neutralized";

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070c);
    const earthSaved = this.result.outcome === "destroyed";
    const titleText = this.add
      .text(width / 2, height * 0.1, info.title, {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "24px",
        color: earthSaved ? "#ffffff" : win ? "#67e8f9" : "#fb7185",
        align: "center",
        wordWrap: { width: width * 0.86 },
      })
      .setOrigin(0.5);

    if (earthSaved) startRainbowPulse(this, titleText);

    this.add
      .text(width / 2, height * 0.16, info.body, {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: "14px",
        color: "#94a3b8",
        align: "center",
        wordWrap: { width: width * 0.82 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.22, `Passes  ${this.result.pass}`, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.44,
        formatLanceReport(this.result.pilotDamage, this.result.pilotStatus),
        {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#cbd5e1",
          align: "left",
          lineSpacing: 2,
        },
      )
      .setOrigin(0.5);

    drawScoreTable(
      this,
      width / 2,
      height * 0.64,
      getScoreBreakdown(this.result.outcome, this.result.pilotStatus),
    );

    this.add
      .text(width / 2, height * 0.9, "ENTER  ·  fly another pass", {
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
