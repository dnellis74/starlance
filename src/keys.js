/** Window-level key state so play works even if Phaser's KeyboardPlugin is missing. */

export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  z: false,
  x: false,
  space: false,
  shift: false,
  enter: false,
};

const down = new Set();

const CODE_MAP = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  KeyZ: "z",
  KeyX: "x",
  Space: "space",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  Enter: "enter",
};

function onDown(event) {
  const name = CODE_MAP[event.code];
  if (!name) return;
  keys[name] = true;
  down.add(name);
  if (event.code === "Space" || event.code.startsWith("Arrow")) {
    event.preventDefault();
  }
}

function onUp(event) {
  const name = CODE_MAP[event.code];
  if (!name) return;
  keys[name] = false;
  down.delete(name);
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
}

export function consume(name) {
  if (!keys[name]) return false;
  keys[name] = false;
  return true;
}
