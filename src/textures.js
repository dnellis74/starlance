import { KINDS } from "./data/kinds.js";

export function generateTextures(scene) {
  rect(scene, "ship", 42, 18, 0x7dd3fc, (g) => {
    g.fillStyle(0x0ea5e9, 1);
    g.fillTriangle(42, 9, 0, 0, 0, 18);
    g.fillStyle(0xf8fafc, 1);
    g.fillTriangle(28, 9, 6, 5, 6, 13);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(2, 7, 8, 4);
  });

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

function rect(scene, key, w, h, color, extra) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  extra?.(g, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}
