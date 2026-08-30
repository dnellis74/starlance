/** Play-scene touch: one-finger drag to fly + auto-laser; separate bomb button. */

const VIEW_W = 540;
const VIEW_H = 960;
const BOMB_X = VIEW_W - 88;
const BOMB_Y = VIEW_H - 108;
const BOMB_VISUAL_R = 56;
const BOMB_HIT_R = 80;
const SPEED_PER_PX = 1.15;

/** True on touch-primary devices and when DevTools emulates mobile (mobile UA). */
export function touchControlsEnabled() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return true;
  if (navigator.userAgentData?.mobile) return true;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return true;
  return false;
}

export function attachPlayTouch(scene) {
  scene.touchEnabled = touchControlsEnabled();
  scene.touchMoveId = null;
  scene.touchBombId = null;
  scene.touchLaser = false;
  scene.touchBomb = false;
  scene.touchGrab = null;

  if (!scene.touchEnabled) return;

  buildBombButton(scene);

  if (scene._touchHandlers) return;

  const onDown = (pointer) => onPointerDown(scene, pointer);
  const onUp = (pointer) => onPointerUp(scene, pointer);
  const onOut = () => clearAllTouch(scene);

  scene._touchHandlers = { onDown, onUp, onOut };
  scene.input.on("pointerdown", onDown);
  scene.input.on("pointerup", onUp);
  scene.input.on("pointerupoutside", onUp);
  scene.input.on("gameout", onOut);

  scene.events.once("shutdown", () => {
    scene.input.off("pointerdown", onDown);
    scene.input.off("pointerup", onUp);
    scene.input.off("pointerupoutside", onUp);
    scene.input.off("gameout", onOut);
    scene._touchHandlers = null;
    clearAllTouch(scene);
  });
}

export function applyTouchFlight(scene, ship, speed, minSpeed, maxSpeed) {
  if (!scene.touchEnabled) return { speed, vx: null, x: null };

  refreshTouchFromPointers(scene);

  if (scene.touchMoveId == null || !scene.touchGrab) {
    return { speed, vx: null, x: null };
  }

  const pointer = pointerById(scene, scene.touchMoveId);
  if (!pointer) return { speed, vx: null, x: null };

  const targetX = scene.touchGrab.shipX + (pointer.x - scene.touchGrab.pointerX);
  const clampedSpeed = clamp(
    scene.touchGrab.speed + (scene.touchGrab.pointerY - pointer.y) * SPEED_PER_PX,
    minSpeed,
    maxSpeed,
  );
  const worldW = scene.physics.world.bounds.width;
  const half = Math.max(8, ship.displayWidth / 2);
  const x = clamp(targetX, half, worldW - half);

  return { speed: clampedSpeed, vx: 0, x };
}

export function isTouchLaser(scene) {
  return !!scene.touchEnabled && !!scene.touchLaser;
}

export function isTouchBomb(scene) {
  return !!scene.touchEnabled && !!scene.touchBomb;
}

export function updateBombButton(scene, bombCd) {
  if (!scene.touchEnabled || !scene.bombFill) return;
  const ready = bombCd <= 0;
  scene.bombFill.setFillStyle(ready ? 0xf59e0b : 0x334155, ready ? 0.92 : 0.55);
  scene.bombRing.setStrokeStyle(3, ready ? 0xfbbf24 : 0x64748b, ready ? 0.95 : 0.45);
  scene.bombLabel.setAlpha(ready ? 1 : 0.45);
  scene.bombBtn.setScale(scene.touchBomb ? 0.94 : 1);
}

export function clearAllTouch(scene) {
  scene.touchMoveId = null;
  scene.touchBombId = null;
  scene.touchLaser = false;
  scene.touchBomb = false;
  scene.touchGrab = null;
  if (scene.bombBtn) scene.bombBtn.setScale(1);
}

function buildBombButton(scene) {
  if (scene.bombBtn) {
    scene.bombBtn.destroy();
  }

  const btn = scene.add.container(BOMB_X, BOMB_Y).setScrollFactor(0).setDepth(80);
  const fill = scene.add.circle(0, 0, BOMB_VISUAL_R, 0xf59e0b, 0.92).setScrollFactor(0);
  const ring = scene.add.circle(0, 0, BOMB_VISUAL_R).setStrokeStyle(3, 0xfbbf24, 0.95).setScrollFactor(0);
  const label = scene.add
    .text(0, 0, "BOMB", {
      fontFamily: "Orbitron, sans-serif",
      fontSize: "15px",
      color: "#0f172a",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setScrollFactor(0);
  btn.add([fill, ring, label]);

  scene.bombBtn = btn;
  scene.bombFill = fill;
  scene.bombRing = ring;
  scene.bombLabel = label;
  scene.bombHitR = BOMB_HIT_R;
}

function hitsBomb(scene, pointer) {
  const dx = pointer.x - BOMB_X;
  const dy = pointer.y - BOMB_Y;
  return dx * dx + dy * dy <= scene.bombHitR * scene.bombHitR;
}

function onPointerDown(scene, pointer) {
  if (scene.transitioning || scene.state?.outcome) return;

  if (scene.touchBombId == null && hitsBomb(scene, pointer)) {
    scene.touchBombId = pointer.id;
    scene.touchBomb = true;
    return;
  }

  if (scene.touchMoveId != null) return;

  scene.touchMoveId = pointer.id;
  scene.touchLaser = true;
  scene.touchGrab = {
    pointerX: pointer.x,
    pointerY: pointer.y,
    shipX: scene.ship.x,
    speed: scene.speed,
  };
}

function onPointerUp(scene, pointer) {
  if (pointer.id === scene.touchBombId) {
    scene.touchBombId = null;
    scene.touchBomb = false;
  }
  if (pointer.id === scene.touchMoveId) {
    scene.touchMoveId = null;
    scene.touchLaser = false;
    scene.touchGrab = null;
  }
}

function refreshTouchFromPointers(scene) {
  if (scene.touchMoveId != null) {
    const p = pointerById(scene, scene.touchMoveId);
    if (!p || !p.isDown) {
      scene.touchMoveId = null;
      scene.touchLaser = false;
      scene.touchGrab = null;
    }
  }
  if (scene.touchBombId != null) {
    const p = pointerById(scene, scene.touchBombId);
    if (!p || !p.isDown) {
      scene.touchBombId = null;
      scene.touchBomb = false;
    }
  }
}

function pointerById(scene, id) {
  const pointers = scene.input.manager?.pointers;
  if (!pointers) return null;
  for (let i = 0; i < pointers.length; i += 1) {
    if (pointers[i]?.id === id) return pointers[i];
  }
  return null;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
