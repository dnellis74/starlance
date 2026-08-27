export const DIFFICULTIES = ["training sim", "green", "veteran", "ace"];

/** Veteran values in PlayScene are the 1.0 baseline. */
const DIFFICULTY_MODS = {
  "training sim": { turretFireRate: 0.25, missileSpeed: 0.49, dreadnaughtDestroyedScore: 1 },
  green: { turretFireRate: 0.5, missileSpeed: 0.7, dreadnaughtDestroyedScore: 2 },
  veteran: { turretFireRate: 1, missileSpeed: 1, dreadnaughtDestroyedScore: 4 },
  ace: { turretFireRate: 2, missileSpeed: 1.3, dreadnaughtDestroyedScore: 8 },
};

let current = DIFFICULTIES[1];

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
