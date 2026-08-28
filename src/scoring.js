import { PILOTS, PILOT_STATUS } from "./data/pilots.js";
import { formatDifficultyLabel, getDifficulty, getDifficultyMods } from "./difficulty.js";

const SCORE_DREADNAUGHT_DESTROYED = 1000;
const SCORE_ALIVE_PILOT = 10_000;
const SCORE_WOUNDED_PILOT = 8_000;

function dreadnaughtDestroyedPoints() {
  return SCORE_DREADNAUGHT_DESTROYED * getDifficultyMods().dreadnaughtDestroyedScore;
}

export function calculateFinalScore(outcome, pilotStatus) {
  if (outcome === "planetLost") return 0;

  let score = 0;
  if (outcome === "destroyed") score += dreadnaughtDestroyedPoints();

  for (const pilot of PILOTS) {
    const status = pilotStatus?.[pilot.id] ?? PILOT_STATUS.ALIVE;
    if (status === PILOT_STATUS.ALIVE) score += SCORE_ALIVE_PILOT;
    else if (status === PILOT_STATUS.WOUNDED) score += SCORE_WOUNDED_PILOT;
  }

  return score;
}

/** @returns {{ title: string, message?: string, rows: Array<{ label: string, value: number, total?: boolean } | { spacer: true }> }} */
export function getScoreBreakdown(outcome, pilotStatus) {
  if (outcome === "planetLost") {
    return {
      title: "SCORE",
      message: "Earth destroyed — no points awarded.",
      rows: [],
    };
  }

  const rows = [];

  let alive = 0;
  let wounded = 0;
  for (const pilot of PILOTS) {
    const status = pilotStatus?.[pilot.id] ?? PILOT_STATUS.ALIVE;
    if (status === PILOT_STATUS.ALIVE) alive += 1;
    else if (status === PILOT_STATUS.WOUNDED) wounded += 1;
  }

  if (alive > 0) {
    rows.push({ label: `Alive pilots (${alive})`, value: alive * SCORE_ALIVE_PILOT });
  }
  if (wounded > 0) {
    rows.push({ label: `Wounded pilots (${wounded})`, value: wounded * SCORE_WOUNDED_PILOT });
  }

  if (outcome === "destroyed") {
    const mul = getDifficultyMods().dreadnaughtDestroyedScore;
    const title = formatDifficultyLabel(getDifficulty());
    rows.push({
      label: `${title} difficulty bonus (${mul}x)`,
      value: dreadnaughtDestroyedPoints(),
    });
  }

  rows.push({ spacer: true });
  rows.push({ label: "Total", value: calculateFinalScore(outcome, pilotStatus), total: true });

  return { title: "SCORE", rows };
}

export function formatScoreValue(value, { total = false } = {}) {
  if (total) return value.toLocaleString();
  return `+${value.toLocaleString()}`;
}
