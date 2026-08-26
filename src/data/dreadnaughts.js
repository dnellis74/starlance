import { KINDS } from "./kinds.js";

/**
 * MVP: one class. Additional classes should be new data objects of this shape,
 * not new scene code.
 *
 * Local layout uses (t, lane) on a left-pointing tip → right stern wedge:
 *   t    = 0 at the bow tip (left) … 1 at the stern (right, full height)
 *   lane = -1 top skin … 0 centerline … +1 bottom skin
 * Height is length / 3 so the hull is taller than the viewport and needs vertical scroll.
 * The player approaches from open space into the tip.
 */
export const LEVIATHAN = {
  id: "leviathan",
  name: "Leviathan-class",
  length: 3600,
  aspect: 3,
  padY: 260,
  /** Pixels of empty approach before the tip (about ~5s at start speed). */
  approachLead: 800,
  components: [
    // Stern engines (wide end, right)
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

export function hullHeight(def) {
  return def.length / (def.aspect ?? 3);
}

/** Half-height of the wedge at normalized length t (0 tip, 1 stern). */
export function wedgeHalfAt(def, t) {
  const clamped = Math.max(0, Math.min(1, t));
  return (hullHeight(def) / 2) * clamped;
}

export function placeOnWedge(def, originX, hullTop, spec) {
  const t = spec.t;
  const half = Math.max(18, wedgeHalfAt(def, t));
  const cy = hullTop + hullHeight(def) / 2;
  const lane = Math.max(-0.92, Math.min(0.92, spec.lane ?? 0));
  return {
    x: originX + t * def.length,
    y: cy + lane * half,
  };
}

export function instantiateDreadnaught(def, originX = null) {
  const lead = def.approachLead ?? 800;
  const startX = originX ?? lead;
  const height = hullHeight(def);
  const hullY = def.padY ?? 260;
  const components = def.components.map((c, i) => {
    const spec = KINDS[c.kind];
    if (!spec) throw new Error(`Unknown component kind: ${c.kind}`);
    const pos = placeOnWedge(def, startX, hullY, c);
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
    hullY,
    hullHeight: height,
    approachLead: lead,
    originX: startX,
    endX: startX + def.length,
    worldHeight: hullY * 2 + height,
    components,
  };
}

export function countAlive(dreadnaught, kind) {
  return dreadnaught.components.filter((c) => c.kind === kind && c.alive).length;
}

export function countKind(dreadnaught, kind) {
  return dreadnaught.components.filter((c) => c.kind === kind).length;
}
