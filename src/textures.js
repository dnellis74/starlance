import { KINDS } from "./data/kinds.js";

export function generateTextures(scene) {
  drawShip(scene, "ship", 42, 18);
  drawShipFlames(scene);
  createShipFlameAnim(scene);

  rect(scene, "laser", 14, 3, 0x67e8f9);
  rect(scene, "bomb", 10, 10, 0xfbbf24, (g) => {
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xfef3c7, 1);
    g.fillCircle(4, 4, 2);
  });
  rect(scene, "bolt", 10, 4, 0xfb7185);
  rect(scene, "missile", 16, 6, 0xfdba74, (g) => {
    g.fillStyle(0xea580c, 1);
    g.fillTriangle(16, 3, 0, 0, 0, 6);
  });
  rect(scene, "hull-panel", 96, 48, 0x1e293b, (g) => {
    g.fillStyle(0x334155, 1);
    g.fillRect(0, 0, 96, 48);
    g.lineStyle(2, 0x475569, 1);
    g.strokeRect(1, 1, 94, 46);
    g.fillStyle(0x0f172a, 0.5);
    g.fillRect(8, 10, 80, 6);
  });

  for (const [kind, spec] of Object.entries(KINDS)) {
    if (kind === "cannon") {
      drawCannon(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawCannon(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    if (kind === "vent") {
      drawVent(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawVent(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    if (kind === "tower") {
      drawTower(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawTower(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    if (kind === "launcher") {
      drawLauncher(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawLauncher(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    if (kind === "bridge") {
      drawBridge(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawBridge(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    if (kind === "silo") {
      drawSilo(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawSilo(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    if (kind === "engine") {
      drawEngine(scene, `comp-${kind}`, spec.w, spec.h, false);
      drawEngine(scene, `comp-${kind}-dead`, spec.w, spec.h, true);
      continue;
    }
    rect(scene, `comp-${kind}`, spec.w, spec.h, spec.color, (g) => {
      g.fillStyle(0x0b1220, 1);
      g.fillRoundedRect(0, 0, spec.w, spec.h, 4);
      g.fillStyle(spec.color, 1);
      g.fillRoundedRect(3, 3, spec.w - 6, spec.h - 6, 3);
      g.fillStyle(0x020617, 0.35);
      g.fillRect(6, spec.h / 2 - 2, spec.w - 12, 4);
    });
    rect(scene, `comp-${kind}-dead`, spec.w, spec.h, 0x1f2937, (g) => {
      g.fillStyle(0x111827, 1);
      g.fillRoundedRect(0, 0, spec.w, spec.h, 4);
      g.lineStyle(2, 0x374151, 1);
      g.strokeRoundedRect(2, 2, spec.w - 4, spec.h - 4, 3);
    });
  }
}

function drawCannon(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  if (dead) {
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(0, 0, w, h, 4);
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(5, 5, w - 10, 11, 3);
    g.fillStyle(0x4b5563, 1);
    g.fillRect(7, h - 9, 5, 8);
    g.fillRect(w - 12, h - 9, 5, 8);
    g.lineStyle(1, 0x1f2937, 1);
    g.strokeRoundedRect(1, 1, w - 2, h - 2, 3);
  } else {
    // Shadow / mount recess behind the barrels.
    g.fillStyle(0x020617, 1);
    g.fillRect(4, 0, w - 8, 9);
    g.fillRect(2, 6, w - 4, 5);

    // Green housing — darker rim, bright glowing core.
    g.fillStyle(0x166534, 1);
    g.fillRoundedRect(3, 4, w - 6, 12, 4);
    g.fillStyle(0x22c55e, 1);
    g.fillRoundedRect(5, 6, w - 10, 8, 3);
    g.fillStyle(0x84cc16, 1);
    g.fillRoundedRect(7, 7, w - 14, 6, 2);
    g.fillStyle(0xbef264, 1);
    g.fillRect(10, 9, w - 20, 2);

    // Twin barrels — white strips with a dark gap between.
    g.fillStyle(0xf8fafc, 1);
    g.fillRect(6, h - 10, 6, 10);
    g.fillRect(w - 12, h - 10, 6, 10);
    g.fillStyle(0xcbd5e1, 1);
    g.fillRect(6, h - 3, 6, 2);
    g.fillRect(w - 12, h - 3, 6, 2);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawVent(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const cx = w / 2;

  if (dead) {
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(2, 2, w - 4, h - 4, 10);
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(6, 5, w - 12, h - 10, 8);
    drawVentSlats(g, cx, h, 0x1f2937);
    g.lineStyle(1, 0x1f2937, 1);
    g.strokeRoundedRect(2, 2, w - 4, h - 4, 10);
  } else {
    g.fillStyle(0x020617, 1);
    g.fillRoundedRect(2, 2, w - 4, h - 4, 10);
    g.fillStyle(0xe2e8f0, 1);
    g.fillRoundedRect(6, 5, w - 12, h - 10, 8);
    drawVentSlats(g, cx, h, 0x020617);
    g.lineStyle(1, 0x000000, 1);
    g.strokeRoundedRect(2, 2, w - 4, h - 4, 10);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawVentSlats(g, cx, h, color) {
  const slats = [
    { y: 7, half: 4 },
    { y: 11, half: 8 },
    { y: 15, half: 8 },
    { y: 19, half: 4 },
  ];
  g.fillStyle(color, 1);
  for (const { y, half } of slats) {
    g.fillRect(cx - half, y, half * 2, 2);
  }
}

function drawPillboxSlit(g, x, y, slitW = 11) {
  g.fillStyle(0x020617, 1);
  g.fillRect(x, y, slitW, 4);
  g.fillStyle(0x0ea5e9, 1);
  g.fillRect(x + 2, y + 1, slitW - 4, 2);
  g.fillStyle(0x67e8f9, 1);
  g.fillRect(x + 3, y + 2, slitW - 6, 1);
}

function drawTower(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const slitW = 11;
  const slitX = Math.round(w / 2 - slitW / 2);

  if (dead) {
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(4, 8, w - 8, h - 10, 5);
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(6, 10, w - 12, h - 14, 4);
    g.fillRoundedRect(7, 2, w - 14, 9, 3);
    for (const y of [13, 19, 25]) {
      g.fillStyle(0x1f2937, 1);
      g.fillRect(slitX, y, slitW, 2);
    }
    g.lineStyle(1, 0x1f2937, 1);
    g.strokeRoundedRect(4, 8, w - 8, h - 10, 5);
  } else {
    g.fillStyle(0x020617, 1);
    g.fillRect(6, h - 3, w - 12, 3);

    // Tall narrow bunker hull — same palette as the bridge.
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(4, 9, w - 8, h - 12, 5);
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(6, 11, w - 12, h - 15, 4);

    // Domed armored roof cap.
    g.fillStyle(0x475569, 1);
    g.fillRoundedRect(6, 2, w - 12, 10, 4);
    g.fillStyle(0x64748b, 1);
    g.fillRoundedRect(8, 3, w - 16, 7, 3);
    g.fillStyle(0x94a3b8, 1);
    g.fillRect(10, 4, w - 20, 2);

    // Embrasures stacked vertically instead of in a row.
    g.fillStyle(0x0f172a, 1);
    g.fillRect(7, 12, w - 14, 18);
    for (const y of [13, 19, 25]) {
      drawPillboxSlit(g, slitX, y, slitW);
    }

    // Corner rivets.
    g.fillStyle(0x475569, 1);
    g.fillCircle(8, 12, 2);
    g.fillCircle(w - 8, 12, 2);
    g.fillCircle(8, h - 6, 2);
    g.fillCircle(w - 8, h - 6, 2);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawLauncher(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  if (dead) {
    g.fillStyle(0x020617, 1);
    g.fillRect(0, h - 4, w, 4);
    g.fillRect(0, 0, 3, h);
    g.fillStyle(0x374151, 1);
    g.fillRect(4, 4, 8, h - 8);
    g.fillRect(1, 10, 4, 6);
    g.fillRect(12, 4, w - 13, 6);
    g.fillRect(12, h - 10, w - 13, 6);
    g.fillStyle(0x111827, 1);
    g.fillRect(12, 10, w - 13, 6);
    g.lineStyle(1, 0x1f2937, 1);
    g.strokeRect(1, 3, w - 2, h - 6);
  } else {
    // Bottom / left shadow.
    g.fillStyle(0x020617, 1);
    g.fillRect(0, h - 4, w, 4);
    g.fillRect(0, 0, 3, h);

    // Green fork body — central spine, left nub, twin launch rails.
    g.fillStyle(0x16a34a, 1);
    g.fillRect(4, 4, 8, h - 8);
    g.fillRect(1, 10, 4, 6);
    g.fillRect(12, 4, w - 13, 6);
    g.fillRect(12, h - 10, w - 13, 6);
    g.fillStyle(0x22c55e, 1);
    g.fillRect(5, 5, 6, h - 10);
    g.fillRect(2, 11, 2, 4);
    g.fillRect(13, 5, w - 14, 4);
    g.fillRect(13, h - 9, w - 14, 4);
    g.fillStyle(0x84cc16, 1);
    g.fillRect(6, 7, 4, h - 14);

    // Open launch bay between the rails.
    g.fillStyle(0x020617, 1);
    g.fillRect(12, 10, w - 13, h - 20);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawBridge(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  if (dead) {
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(2, 8, w - 4, h - 10, 7);
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(6, 11, w - 12, h - 16, 5);
    g.fillRoundedRect(10, 4, w - 20, 10, 4);
    g.fillStyle(0x1f2937, 1);
    g.fillRect(13, h - 9, 10, 2);
    g.fillRect(23, h - 9, 10, 2);
    g.fillRect(33, h - 9, 10, 2);
    g.lineStyle(1, 0x1f2937, 1);
    g.strokeRoundedRect(2, 8, w - 4, h - 10, 7);
  } else {
    g.fillStyle(0x020617, 1);
    g.fillRect(4, h - 3, w - 6, 3);

    // Low, wide bunker hull.
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(2, 8, w - 4, h - 10, 7);
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(5, 11, w - 10, h - 15, 5);

    // Domed armored roof cap.
    g.fillStyle(0x475569, 1);
    g.fillRoundedRect(8, 3, w - 16, 12, 5);
    g.fillStyle(0x64748b, 1);
    g.fillRoundedRect(10, 4, w - 20, 8, 4);
    g.fillStyle(0x94a3b8, 1);
    g.fillRect(14, 5, w - 28, 2);

    // Embrasure row — three glowing gun slits.
    g.fillStyle(0x0f172a, 1);
    g.fillRect(8, h - 11, w - 16, 6);
    for (const x of [12, 22, 32]) {
      drawPillboxSlit(g, x, h - 10);
    }

    // Corner rivets.
    g.fillStyle(0x475569, 1);
    g.fillCircle(9, 14, 2);
    g.fillCircle(w - 9, 14, 2);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawHazardRing(g, cx, cy, outerR, innerR, dead) {
  const segments = 16;
  for (let i = 0; i < segments; i += 1) {
    const a0 = (i / segments) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2;
    const yellow = dead ? 0x6b7280 : 0xfacc15;
    const black = 0x020617;
    g.fillStyle(i % 2 === 0 ? yellow : black, 1);
    g.beginPath();
    g.arc(cx, cy, outerR, a0, a1, false);
    g.arc(cx, cy, innerR, a1, a0, true);
    g.closePath();
    g.fillPath();
  }
}

function drawPipePath(g, width, outer, mid, glow, segments) {
  g.lineStyle(width, outer, 1);
  g.beginPath();
  g.moveTo(segments[0].x, segments[0].y);
  for (let i = 1; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg.arc) {
      g.arc(seg.cx, seg.cy, seg.r, seg.start, seg.end, seg.ccw ?? false);
    } else {
      g.lineTo(seg.x, seg.y);
    }
  }
  g.strokePath();

  g.lineStyle(Math.max(2, width - 5), mid, 1);
  g.beginPath();
  g.moveTo(segments[0].x, segments[0].y);
  for (let i = 1; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg.arc) {
      g.arc(seg.cx, seg.cy, seg.r, seg.start, seg.end, seg.ccw ?? false);
    } else {
      g.lineTo(seg.x, seg.y);
    }
  }
  g.strokePath();

  if (glow) {
    g.lineStyle(2, glow, 0.85);
    g.beginPath();
    g.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i += 1) {
      const seg = segments[i];
      if (seg.arc) {
        g.arc(seg.cx, seg.cy, seg.r, seg.start, seg.end, seg.ccw ?? false);
      } else {
        g.lineTo(seg.x, seg.y);
      }
    }
    g.strokePath();
  }
}

function drawPipeFlange(g, x, y, r, outer, inner, dead) {
  g.fillStyle(outer, 1);
  g.fillCircle(x, y, r);
  g.fillStyle(inner, 1);
  g.fillCircle(x, y, r - 2);
  if (!dead) {
    g.fillStyle(0x94a3b8, 1);
    g.fillCircle(x - 1, y - 1, 1);
  }
  g.lineStyle(1, dead ? 0x111827 : 0x020617, 1);
  g.strokeCircle(x, y, r);
}

function drawEngine(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const outer = dead ? 0x374151 : 0x57534e;
  const mid = dead ? 0x4b5563 : 0x78716c;
  const glow = dead ? null : 0xf59e0b;
  const glowHot = dead ? null : 0xfbbf24;
  const frame = dead ? 0x1f2937 : 0x1e293b;
  const frameHi = dead ? 0x374151 : 0x334155;

  // Mounting plate and central pipe rack.
  g.fillStyle(dead ? 0x111827 : 0x0f172a, 1);
  g.fillRect(2, h - 5, w - 4, 5);
  g.fillStyle(frame, 1);
  g.fillRoundedRect(16, 10, 24, h - 16, 4);
  g.fillStyle(frameHi, 1);
  g.fillRoundedRect(18, 12, 20, h - 20, 3);
  g.fillStyle(dead ? 0x111827 : 0x020617, 1);
  g.fillRect(20, 14, 16, 8);
  g.fillRect(22, 24, 12, 6);

  // Left pipe — snakes up the rack, curls over, exits toward the stern.
  drawPipePath(g, 9, outer, mid, glow, [
    { x: 8, y: h - 4 },
    { x: 8, y: 26 },
    { arc: true, cx: 14, cy: 26, r: 6, start: Math.PI, end: Math.PI * 1.5, ccw: false },
    { x: 22, y: 20 },
    { arc: true, cx: 22, cy: 14, r: 6, start: Math.PI / 2, end: 0, ccw: true },
    { x: 34, y: 8 },
    { x: w - 6, y: 8 },
  ]);
  drawPipeFlange(g, 8, h - 6, 5, outer, mid, dead);
  drawPipeFlange(g, 22, 20, 4, outer, mid, dead);
  drawPipeFlange(g, 34, 8, 4, outer, mid, dead);

  // Right pipe — double bend weaving behind the rack.
  drawPipePath(g, 8, outer, mid, glowHot, [
    { x: w - 8, y: h - 4 },
    { x: w - 8, y: 30 },
    { arc: true, cx: w - 14, cy: 30, r: 6, start: 0, end: Math.PI / 2, ccw: false },
    { x: w - 20, y: 24 },
    { arc: true, cx: w - 26, cy: 24, r: 6, start: 0, end: Math.PI, ccw: false },
    { x: w - 32, y: 30 },
    { arc: true, cx: w - 32, cy: 36, r: 6, start: Math.PI * 1.5, end: Math.PI, ccw: false },
    { x: w - 38, y: h - 4 },
  ]);
  drawPipeFlange(g, w - 8, h - 6, 5, outer, mid, dead);
  drawPipeFlange(g, w - 20, 24, 4, outer, mid, dead);
  drawPipeFlange(g, w - 32, 30, 4, outer, mid, dead);

  // Foreground cross-pipe — tight S-curve across the face of the building.
  drawPipePath(g, 7, outer, mid, glow, [
    { x: 12, y: h - 8 },
    { arc: true, cx: 18, cy: h - 8, r: 6, start: Math.PI, end: Math.PI / 2, ccw: true },
    { x: 24, y: h - 14 },
    { arc: true, cx: 30, cy: h - 14, r: 6, start: Math.PI * 1.5, end: 0, ccw: false },
    { x: 36, y: h - 8 },
    { arc: true, cx: 42, cy: h - 8, r: 6, start: Math.PI, end: Math.PI / 2, ccw: true },
    { x: 48, y: h - 14 },
  ]);
  drawPipeFlange(g, 12, h - 8, 4, outer, mid, dead);
  drawPipeFlange(g, 36, h - 8, 4, outer, mid, dead);
  drawPipeFlange(g, 48, h - 14, 4, outer, mid, dead);

  // Small vertical feeder pipes into the rack.
  g.fillStyle(outer, 1);
  g.fillRect(24, 6, 5, 8);
  g.fillRect(31, 6, 5, 8);
  g.fillStyle(mid, 1);
  g.fillRect(25, 7, 3, 6);
  g.fillRect(32, 7, 3, 6);
  if (!dead) {
    g.fillStyle(0xf97316, 0.7);
    g.fillRect(26, 8, 1, 4);
    g.fillRect(33, 8, 1, 4);
  }

  // Rivets and wear on the rack face.
  g.fillStyle(dead ? 0x111827 : 0x475569, 1);
  for (const y of [16, 22, 28]) {
    g.fillCircle(17, y, 1.5);
    g.fillCircle(w - 17, y, 1.5);
  }

  if (dead) {
    g.lineStyle(1, 0x111827, 0.9);
    g.lineBetween(19, 15, 27, 21);
    g.lineBetween(28, 14, 36, 20);
    g.lineBetween(24, 28, 32, 32);
    g.fillStyle(0x111827, 0.45);
    g.fillCircle(26, 18, 3);
    g.fillCircle(w - 24, 28, 2);
  } else {
    // Heat shimmer on the hottest bend.
    g.fillStyle(0xfbbf24, 0.35);
    g.fillCircle(34, 8, 3);
    g.fillStyle(0xf59e0b, 0.25);
    g.fillCircle(w - 20, 24, 4);
  }

  g.lineStyle(1, dead ? 0x111827 : 0x020617, 1);
  g.strokeRoundedRect(16, 10, 24, h - 16, 4);

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawSilo(scene, key, w, h, dead) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const cx = w / 2;
  const cy = h / 2;
  const petals = 8;

  drawHazardRing(g, cx, cy, 19, 14, dead);

  // Recessed silo well.
  g.fillStyle(dead ? 0x1f2937 : 0x0f172a, 1);
  g.fillCircle(cx, cy, 14);

  // Closed diaphragm door — alternating wedge plates.
  for (let i = 0; i < petals; i += 1) {
    const a0 = (i / petals) * Math.PI * 2 - Math.PI / 2 + 0.04;
    const a1 = ((i + 1) / petals) * Math.PI * 2 - Math.PI / 2 - 0.04;
    if (dead) {
      g.fillStyle(i % 2 === 0 ? 0x374151 : 0x4b5563, 1);
    } else {
      g.fillStyle(i % 2 === 0 ? 0x334155 : 0x475569, 1);
    }
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, 12, a0, a1, false);
    g.closePath();
    g.fillPath();
  }

  // Radial seam lines between door segments.
  g.lineStyle(1, dead ? 0x111827 : 0x020617, 1);
  for (let i = 0; i < petals; i += 1) {
    const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
    g.lineBetween(cx, cy, cx + Math.cos(angle) * 12, cy + Math.sin(angle) * 12);
  }

  // Center locking hub.
  g.fillStyle(dead ? 0x111827 : 0x1e293b, 1);
  g.fillCircle(cx, cy, 4);
  g.fillStyle(dead ? 0x4b5563 : 0x64748b, 1);
  g.fillCircle(cx, cy, 2);
  if (!dead) {
    g.fillStyle(0x94a3b8, 1);
    g.fillCircle(cx, cy, 1);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function drawShip(scene, key, w, h) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x0ea5e9, 1);
  g.fillTriangle(42, 9, 0, 0, 0, 18);
  g.fillStyle(0xf8fafc, 1);
  g.fillTriangle(28, 9, 6, 5, 6, 13);
  g.fillStyle(0x38bdf8, 1);
  g.fillRect(2, 7, 8, 4);
  g.generateTexture(key, w, h);
  g.destroy();
}

const SHIP_FLAME_FRAMES = [
  { h: 14, outer: 0xf97316, mid: 0xfbbf24, core: 0xfef08a },
  { h: 17, outer: 0xea580c, mid: 0xf97316, core: 0xffffff },
  { h: 13, outer: 0xfb923c, mid: 0xfacc15, core: 0xfef9c3 },
  { h: 16, outer: 0xf97316, mid: 0xfde047, core: 0xfff7ed },
];

function drawShipFlames(scene) {
  const w = 12;
  SHIP_FLAME_FRAMES.forEach((frame, i) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const { h, outer, mid, core } = frame;
    g.fillStyle(outer, 1);
    g.fillTriangle(w / 2, h, 0, 0, w, 0);
    g.fillStyle(mid, 1);
    g.fillTriangle(w / 2, h - 2, 1, 1, w - 1, 1);
    g.fillStyle(core, 1);
    g.fillTriangle(w / 2, h - 5, 3, 3, w - 3, 3);
    g.generateTexture(`ship-flame-${i}`, w, h);
    g.destroy();
  });
}

export function createShipFlameAnim(scene) {
  if (scene.anims.exists("ship-flame")) return;
  scene.anims.create({
    key: "ship-flame",
    frames: SHIP_FLAME_FRAMES.map((_, i) => ({ key: `ship-flame-${i}` })),
    frameRate: 14,
    repeat: -1,
  });
}

function rect(scene, key, w, h, color, extra) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  extra?.(g, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}
