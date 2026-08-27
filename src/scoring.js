import { PILOTS, PILOT_STATUS } from "./data/pilots.js";

const SCORE_DREADNAUGHT_DESTROYED = 1000;
const SCORE_ALIVE_PILOT = 10_000;
const SCORE_WOUNDED_PILOT = 8_000;

export function calculateFinalScore(outcome, pilotStatus) {
  if (outcome === "planetLost") return 0;

  let score = 0;
  if (outcome === "destroyed") score += SCORE_DREADNAUGHT_DESTROYED;

  for (const pilot of PILOTS) {
    const status = pilotStatus?.[pilot.id] ?? PILOT_STATUS.ALIVE;
    if (status === PILOT_STATUS.ALIVE) score += SCORE_ALIVE_PILOT;
    else if (status === PILOT_STATUS.WOUNDED) score += SCORE_WOUNDED_PILOT;
  }

  return score;
}

export function formatScoreBreakdown(outcome, pilotStatus) {
  if (outcome === "planetLost") {
    return ["SCORE", "", "Earth destroyed — no points awarded."].join("\n");
  }

  const lines = ["SCORE", ""];
  if (outcome === "destroyed") {
    lines.push(`Dreadnaught destroyed     +${SCORE_DREADNAUGHT_DESTROYED.toLocaleString()}`);
  }

  let alive = 0;
  let wounded = 0;
  for (const pilot of PILOTS) {
    const status = pilotStatus?.[pilot.id] ?? PILOT_STATUS.ALIVE;
    if (status === PILOT_STATUS.ALIVE) alive += 1;
    else if (status === PILOT_STATUS.WOUNDED) wounded += 1;
  }

  if (alive > 0) {
    lines.push(
      `Alive pilots (${alive})        +${(alive * SCORE_ALIVE_PILOT).toLocaleString()}`,
    );
  }
  if (wounded > 0) {
    lines.push(
      `Wounded pilots (${wounded})     +${(wounded * SCORE_WOUNDED_PILOT).toLocaleString()}`,
    );
  }

  lines.push("", `Total                     ${calculateFinalScore(outcome, pilotStatus).toLocaleString()}`);
  return lines.join("\n");
}
