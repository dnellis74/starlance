/** Game stats — skills, scoring, combat tuning, and difficulty modifiers. */

export const DIFFICULTIES = ["training sim", "green", "veteran", "ace"];

/** MVP: a single selectable skill. Extra skills can be added as more records. */
export const SKILLS = Object.freeze({
  standard: Object.freeze({
    id: "standard",
    name: "Standard",
    maxHull: 100,
    maxRange: 80,
    initialCruiserSpeed: 10,
    engineSpeedPenalty: 2,
    fireIntervalMs: 1400,
  }),
});

export const SCORE = {
  dreadnaughtDestroyed: 1000,
  alivePilot: 10_000,
  woundedPilot: 8_000,
};

export const COMBAT = {
  boltSpeed: 270,
  missileSpeed: 150,
  boltDamage: 50,
  missileDamage: 100,
  missileInterceptDamage: 25,
  bridgeDestroyedFireRate: 0.5,
};

/** Veteran values in PlayScene are the 1.0 baseline. */
const DIFFICULTY_MODS = {
  "training sim": { turretFireRate: 0.25, missileSpeed: 0.49, dreadnaughtDestroyedScore: 1 },
  green: { turretFireRate: 0.5, missileSpeed: 0.7, dreadnaughtDestroyedScore: 2 },
  veteran: { turretFireRate: 1, missileSpeed: 1, dreadnaughtDestroyedScore: 4 },
  ace: { turretFireRate: 2, missileSpeed: 1.3, dreadnaughtDestroyedScore: 8 },
};

let current = DIFFICULTIES[1];

export function getSkill(skillId = "standard") {
  const skill = SKILLS[skillId] ?? SKILLS.standard;
  return { ...skill };
}

export function getDifficulty() {
  return current;
}

export function getDifficultyIndex() {
  const index = DIFFICULTIES.indexOf(current);
  return index >= 0 ? index : 0;
}

export function setDifficulty(level) {
  if (!DIFFICULTIES.includes(level)) return;
  current = level;
}

export function setDifficultyIndex(index) {
  const count = DIFFICULTIES.length;
  const next = ((index % count) + count) % count;
  current = DIFFICULTIES[next];
  return current;
}

export function formatDifficultyLabel(level) {
  return level.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getDifficultyMods() {
  return DIFFICULTY_MODS[current] ?? DIFFICULTY_MODS.veteran;
}

if (typeof globalThis !== "undefined") {
  Object.defineProperty(globalThis, "difficulty", {
    get: getDifficulty,
    set: setDifficulty,
    configurable: true,
  });
}
