import Phaser from "../engine.js";
import { keys, consume } from "../keys.js";
import { MAX_PILOTS, PILOTS, formatPilotStatus } from "../data/pilots.js";
import { formatScoreBreakdown } from "../scoring.js";

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
    title: "LANCE LOST",
    body: `All ${MAX_PILOTS} pilots of the lance are gone. The dreadnaught continues its run.`,
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
    this.add
      .text(width / 2, height * 0.1, info.title, {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "24px",
        color: win ? "#67e8f9" : "#fb7185",
        align: "center",
        wordWrap: { width: width * 0.86 },
      })
      .setOrigin(0.5);

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

    this.add
      .text(
        width / 2,
        height * 0.72,
        formatScoreBreakdown(this.result.outcome, this.result.pilotStatus),
        {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#e2e8f0",
          align: "left",
          lineSpacing: 3,
        },
      )
      .setOrigin(0.5);

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
