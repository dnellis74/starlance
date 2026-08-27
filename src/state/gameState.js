import { KINDS } from "../data/kinds.js";
import {
  LEVIATHAN,
  instantiateDreadnaught,
  countAlive,
  countKind,
} from "../data/dreadnaughts.js";
import {
  MAX_PILOTS,
  PILOTS,
  PILOT_STATUS,
  pilotForIndex,
  pilotsAvailable,
} from "../data/pilots.js";

/** MVP: a single selectable skill. Extra skills can be added as more records. */
export const SKILLS = {
  standard: {
    id: "standard",
    name: "Standard",
    maxHull: 100,
    maxRange: 80,
    initialCruiserSpeed: 10,
    engineSpeedPenalty: 2,
    fireIntervalMs: 1400,
  },
};

function createPilotStatus() {
  return Object.fromEntries(PILOTS.map((p) => [p.id, PILOT_STATUS.ALIVE]));
}

export function createGameState(skillId = "standard") {
  const skill = SKILLS[skillId] ?? SKILLS.standard;
  const dreadnaught = instantiateDreadnaught(LEVIATHAN);

  return {
    damage: 0,
    pilotDamage: Object.fromEntries(PILOTS.map((p) => [p.id, 0])),
    pilotStatus: createPilotStatus(),
    fighter: 1,
    hull: skill.maxHull,
    pass: 0,
    range: skill.maxRange,
    cruiserSpeed: skill.initialCruiserSpeed,
    skill,
    outcome: null,
    fireRateMul: 1,
    dreadnaught,
  };
}

export function currentPilot(state) {
  return pilotForIndex(state.fighter);
}

export function pilotStatus(state, pilotId) {
  return state.pilotStatus[pilotId] ?? PILOT_STATUS.ALIVE;
}

export function assignRunPilot(state) {
  state.fighter = ((state.pass - 1) % MAX_PILOTS) + 1;
}

export function woundPilot(state) {
  const pilot = currentPilot(state);
  if (!pilot) return;
  if (state.pilotStatus[pilot.id] === PILOT_STATUS.ALIVE) {
    state.pilotStatus[pilot.id] = PILOT_STATUS.WOUNDED;
  }
}

export function killPilot(state) {
  const pilot = currentPilot(state);
  if (pilot) state.pilotStatus[pilot.id] = PILOT_STATUS.KIA;
}

function checkLanceLost(state) {
  if (pilotsAvailable(state.pilotStatus) === 0) {
    state.outcome = "gameOver";
    return true;
  }
  const pilot = currentPilot(state);
  if (pilot && state.pilotStatus[pilot.id] === PILOT_STATUS.KIA) {
    state.outcome = "gameOver";
    return true;
  }
  return false;
}

export function addDamage(state, amount) {
  state.damage += amount;
  const pilot = currentPilot(state);
  if (pilot) {
    state.pilotDamage[pilot.id] = (state.pilotDamage[pilot.id] ?? 0) + amount;
  }
}

export function damageComponent(state, componentId) {
  const component = state.dreadnaught.components.find((c) => c.id === componentId);
  if (!component || !component.alive) return null;

  component.hp -= 1;
  if (component.hp > 0) return { destroyed: false, component };

  component.alive = false;
  addDamage(state, KINDS[component.kind].damage);
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
  }

  return {
    ventsLeft: vents,
    silosLeft: silos,
    bridgesLeft: bridges,
    enginesLeft: countAlive(state.dreadnaught, "engine"),
    explode: state.outcome === "destroyed",
  };
}

export function cruiserSpeed(state) {
  const enginesDestroyed =
    countKind(state.dreadnaught, "engine") - countAlive(state.dreadnaught, "engine");
  return Math.max(
    0,
    state.skill.initialCruiserSpeed - enginesDestroyed * state.skill.engineSpeedPenalty,
  );
}

export function advanceCruiser(state) {
  state.cruiserSpeed = cruiserSpeed(state);
  state.range = Math.max(0, +(state.range - state.cruiserSpeed).toFixed(2));

  if (state.range <= 0) {
    if (countAlive(state.dreadnaught, "silo") === 0) {
      state.outcome = "neutralized";
    } else {
      state.outcome = "planetLost";
    }
  }

  return state.outcome;
}

export function applyHullDamage(state, amount) {
  state.hull = Math.max(0, state.hull - amount);
}

export function resetRunHull(state) {
  state.hull = state.skill.maxHull;
}

/** Start a new run — advances pass, rotates pilot, optionally advances the dreadnaught. */
export function beginRun(state, { advance = true } = {}) {
  if (advance) {
    advanceCruiser(state);
    if (state.outcome) return state.outcome;
  }
  state.pass += 1;
  assignRunPilot(state);
  if (checkLanceLost(state)) return state.outcome;
  resetRunHull(state);
  return state.outcome;
}

export function hudSnapshot(state) {
  const pilot = currentPilot(state);
  const status = pilot ? pilotStatus(state, pilot.id) : PILOT_STATUS.ALIVE;
  return {
    damage: state.damage,
    fighter: state.fighter,
    callsign: pilot?.callsign ?? "—",
    pilotStatus: status,
    pilotsLeft: pilotsAvailable(state.pilotStatus),
    pilotsMax: MAX_PILOTS,
    hull: state.hull,
    maxHull: state.skill.maxHull,
    pass: state.pass,
    range: state.range,
    maxRange: state.skill.maxRange,
    cruiserSpeed: state.cruiserSpeed,
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
