import { KINDS } from "../data/kinds.js";
import {
  LEVIATHAN,
  instantiateDreadnaught,
  countAlive,
  countKind,
} from "../data/dreadnaughts.js";

/** MVP: a single selectable skill. Extra skills can be added as more records. */
export const SKILLS = {
  standard: {
    id: "standard",
    name: "Standard",
    maxDamage: 100,
    maxRange: 7,
    baseAdvance: 1,
    engineSlowPerKill: 0.18,
    minAdvance: 0.28,
    fireIntervalMs: 1400,
  },
};

export function createGameState(skillId = "standard") {
  const skill = SKILLS[skillId] ?? SKILLS.standard;
  const dreadnaught = instantiateDreadnaught(LEVIATHAN);

  return {
    score: 0,
    fighter: 1,
    damage: skill.maxDamage,
    pass: 0,
    range: skill.maxRange,
    skill,
    outcome: null,
    fireRateMul: 1,
    dreadnaught,
  };
}

export function damageComponent(state, componentId) {
  const component = state.dreadnaught.components.find((c) => c.id === componentId);
  if (!component || !component.alive) return null;

  component.hp -= 1;
  if (component.hp > 0) return { destroyed: false, component };

  component.alive = false;
  state.score += KINDS[component.kind].score;
  const effects = syncDerivedState(state);
  return { destroyed: true, component, effects };
}

export function syncDerivedState(state) {
  const vents = countAlive(state.dreadnaught, "vent");
  const silos = countAlive(state.dreadnaught, "silo");
  const bridges = countAlive(state.dreadnaught, "bridge");

  state.fireRateMul = bridges === 0 ? 0.5 : 1;

  if (vents === 0) {
    state.outcome = "destroyed";
    state.score += 5000;
  }

  return {
    ventsLeft: vents,
    silosLeft: silos,
    bridgesLeft: bridges,
    enginesLeft: countAlive(state.dreadnaught, "engine"),
    explode: state.outcome === "destroyed",
  };
}

export function advanceDreadnaught(state) {
  const totalEngines = countKind(state.dreadnaught, "engine");
  const enginesDestroyed = totalEngines - countAlive(state.dreadnaught, "engine");
  const step = Math.max(
    state.skill.minAdvance,
    state.skill.baseAdvance - enginesDestroyed * state.skill.engineSlowPerKill,
  );
  state.range = Math.max(0, +(state.range - step).toFixed(2));

  if (state.range <= 0) {
    if (countAlive(state.dreadnaught, "silo") === 0) {
      state.outcome = "neutralized";
      state.score += 3500;
    } else {
      state.outcome = "planetLost";
    }
  }

  return state.outcome;
}

export function applyDamage(state, amount) {
  state.damage = Math.max(0, state.damage - amount);
}

export function resetRunHealth(state) {
  state.damage = state.skill.maxDamage;
}

/** Start a new run — always bumps attack pass; optionally swaps in the next fighter. */
export function beginRun(state, { nextFighter = false } = {}) {
  state.pass += 1;
  if (nextFighter) state.fighter += 1;
  resetRunHealth(state);
}

export function hudSnapshot(state) {
  return {
    score: state.score,
    fighter: state.fighter,
    damage: state.damage,
    maxDamage: state.skill.maxDamage,
    pass: state.pass,
    range: state.range,
    maxRange: state.skill.maxRange,
    vents: countAlive(state.dreadnaught, "vent"),
    ventsMax: countKind(state.dreadnaught, "vent"),
    silos: countAlive(state.dreadnaught, "silo"),
    silosMax: countKind(state.dreadnaught, "silo"),
    engines: countAlive(state.dreadnaught, "engine"),
    enginesMax: countKind(state.dreadnaught, "engine"),
    bridges: countAlive(state.dreadnaught, "bridge"),
    bridgesMax: countKind(state.dreadnaught, "bridge"),
    fireRateMul: state.fireRateMul,
    className: state.dreadnaught.name,
  };
}
