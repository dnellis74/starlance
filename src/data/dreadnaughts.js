import { KINDS } from "./kinds.js";

/**
 * MVP: one class. Additional classes should be new data objects of this shape,
 * not new scene code.
 *
 * Portrait layout — tip at the bottom, stern at the top (Phaser y grows downward,
 * so the ship flies toward smaller y):
 *   t    = 0 at the bow tip (bottom) … 1 at the stern (top, full width)
 *   lane = -1 left skin … 0 centerline … +1 right skin
 * Hull width at the stern is length / 3 — wider than a phone viewport, so the
 * player must strafe. Forward length exceeds the viewport, so the camera scrolls up.
 */
export const LEVIATHAN = {
  id: "leviathan",
  name: "Leviathan-class",
  length: 3600,
  aspect: 3,
  padX: 120,
  /** Empty space below the tip before the interceptor starts. */
  approachLead: 900,
  /** Clearance above the stern for the stargate exit. */
  exitLead: 520,
  components: [
    { kind: "engine", t: 0.965, lane: -0.78 },
    { kind: "engine", t: 0.965, lane: -0.28 },
    { kind: "engine", t: 0.965, lane: 0.28 },
    { kind: "engine", t: 0.965, lane: 0.78 },

    { kind: "bridge", t: 0.8, lane: -0.52 },
    { kind: "bridge", t: 0.52, lane: -0.42 },
    { kind: "bridge", t: 0.26, lane: -0.28 },

    { kind: "silo", t: 0.74, lane: 0.38 },
    { kind: "silo", t: 0.6, lane: -0.18 },
    { kind: "silo", t: 0.44, lane: 0.32 },
    { kind: "silo", t: 0.3, lane: -0.12 },
    { kind: "silo", t: 0.16, lane: 0.18 },

    ...ventRow(0.42, 0.9, 8, -0.48),
    ...ventRow(0.4, 0.88, 8, 0.5),

    { kind: "cannon", t: 0.88, lane: -0.68 },
    { kind: "cannon", t: 0.82, lane: 0.7 },
    { kind: "cannon", t: 0.68, lane: -0.7 },
    { kind: "cannon", t: 0.62, lane: 0.62 },
    { kind: "cannon", t: 0.48, lane: -0.62 },
    { kind: "cannon", t: 0.38, lane: 0.55 },
    { kind: "cannon", t: 0.22, lane: -0.4 },
    { kind: "cannon", t: 0.12, lane: 0.32 },

    { kind: "launcher", t: 0.84, lane: -0.12 },
    { kind: "launcher", t: 0.66, lane: 0.22 },
    { kind: "launcher", t: 0.5, lane: -0.08 },
    { kind: "launcher", t: 0.34, lane: 0.2 },
    { kind: "launcher", t: 0.18, lane: -0.05 },

    { kind: "tower", t: 0.76, lane: 0.68 },
    { kind: "tower", t: 0.56, lane: -0.68 },
    { kind: "tower", t: 0.36, lane: -0.55 },
    { kind: "tower", t: 0.2, lane: 0.48 },
  ],
};

function ventRow(t0, t1, count, lane) {
  const vents = [];
  for (let i = 0; i < count; i += 1) {
    const u = count === 1 ? 0 : i / (count - 1);
    vents.push({ kind: "vent", t: t0 + (t1 - t0) * u, lane });
  }
  return vents;
}

export function hullWidth(def) {
  return def.length / (def.aspect ?? 3);
}

/** Half-width of the wedge at normalized length t (0 tip, 1 stern). */
export function wedgeHalfAt(def, t) {
  const clamped = Math.max(0, Math.min(1, t));
  return (hullWidth(def) / 2) * clamped;
}

export function placeOnWedge(def, centerX, tipY, spec) {
  const t = spec.t;
  const half = Math.max(18, wedgeHalfAt(def, t));
  const lane = Math.max(-0.92, Math.min(0.92, spec.lane ?? 0));
  return {
    x: centerX + lane * half,
    // Tip at larger y (bottom); stern toward smaller y (top).
    y: tipY - t * def.length,
  };
}

export function instantiateDreadnaught(def) {
  const lead = def.approachLead ?? 900;
  const exit = def.exitLead ?? 520;
  const width = hullWidth(def);
  const padX = def.padX ?? 120;
  const worldW = width + padX * 2;
  const worldH = exit + def.length + lead;
  const centerX = worldW / 2;
  const tipY = exit + def.length;
  const sternY = exit;

  const components = def.components.map((c, i) => {
    const spec = KINDS[c.kind];
    if (!spec) throw new Error(`Unknown component kind: ${c.kind}`);
    const pos = placeOnWedge(def, centerX, tipY, c);
    return {
      id: `${c.kind}-${i}`,
      kind: c.kind,
      x: pos.x,
      y: pos.y,
      t: c.t,
      lane: c.lane,
      w: spec.w,
      h: spec.h,
      hp: spec.hp,
      maxHp: spec.hp,
      alive: true,
      weapon: spec.weapon,
      fires: spec.fires ?? null,
    };
  });

  return {
    id: def.id,
    name: def.name,
    length: def.length,
    hullWidth: width,
    approachLead: lead,
    exitLead: exit,
    centerX,
    tipY,
    sternY,
    endY: sternY,
    worldWidth: worldW,
    worldHeight: worldH,
    components,
  };
}

export function countAlive(dreadnaught, kind) {
  return dreadnaught.components.filter((c) => c.kind === kind && c.alive).length;
}

export function countKind(dreadnaught, kind) {
  return dreadnaught.components.filter((c) => c.kind === kind).length;
}
