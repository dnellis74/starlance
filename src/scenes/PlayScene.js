import Phaser from "../engine.js";
import { keys } from "../keys.js";
import { WEAPON } from "../data/kinds.js";
import { setLaunchVisible } from "../ui.js";
import {
  createGameState,
  damageComponent,
  beginRun,
  applyDamage,
  hudSnapshot,
} from "../state/gameState.js";

// Portrait canvas — tall phone layout; primary scroll is bottom → top.
const VIEW_W = 540;
const VIEW_H = 960;
const MIN_SPEED = 70;
const MAX_SPEED = 300;
const START_SPEED = 155;
const STRAFE_SPEED = 170;
const SPAWN_MARGIN = 100;
const LASER_COOLDOWN = 240;
const LASER_LIFETIME = 1000;
const LASER_FADE = 280;
const BOMB_COOLDOWN = 420;
const BOLT_SPEED = 270;
const BOLT_DAMAGE = 50;
const MISSILE_DAMAGE = 100;

export class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    setLaunchVisible(false);
    try {
      this.bootPlay();
    } catch (err) {
      console.error(err);
      this.add
        .text(24, 24, `PlayScene failed:\n${err?.stack || err}`, {
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#fb7185",
          wordWrap: { width: VIEW_W - 48 },
        })
        .setScrollFactor(0)
        .setDepth(1000);
    }
  }

  bootPlay() {
    this.state = createGameState("standard");
    this.speed = START_SPEED;
    this.laserCd = 0;
    this.bombCd = 0;
    this.invuln = 2200;
    this.transitioning = false;
    this.compSprites = new Map();
    this.engineThrusters = new Map();
    this.compGroup = this.physics.add.staticGroup();
    this.lasers = this.physics.add.group();
    this.bombs = this.physics.add.group();
    this.bolts = this.physics.add.group();
    this.missiles = this.physics.add.group();

    const dn = this.state.dreadnaught;
    const worldW = dn.worldWidth;
    const worldH = dn.worldHeight;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    this.drawBackdrop(worldW, worldH);
    this.drawHull(dn);
    this.spawnComponents(dn);

    const spawnY = dn.tipY + dn.approachLead - SPAWN_MARGIN;
    this.ship = this.physics.add.sprite(dn.centerX, spawnY, "ship");
    this.ship.setDepth(20);
    this.ship.setAngle(-90);
    this.ship.body.setSize(14, 36);
    this.ship.setCollideWorldBounds(true);

    this.flame = this.add.sprite(this.ship.x, this.ship.y + 20, "ship-flame-0");
    this.flame.setDepth(19);
    this.flame.play("ship-flame");

    this.physics.add.overlap(this.lasers, this.missiles, (laser, missile) => {
      laser.destroy();
      missile.destroy();
      this.state.score += 25;
      this.refreshHud();
    });
    this.physics.add.overlap(this.lasers, this.compGroup, (laser, sprite) => {
      this.strike(sprite, WEAPON.laser, laser);
    });
    this.physics.add.overlap(this.bombs, this.compGroup, (bomb, sprite) => {
      this.strike(sprite, WEAPON.bomb, bomb);
    });
    this.physics.add.overlap(this.ship, this.bolts, (_, shot) => this.hitPlayer(shot, BOLT_DAMAGE));
    this.physics.add.overlap(this.ship, this.missiles, (_, shot) => this.hitPlayer(shot, MISSILE_DAMAGE));

    // Keep the ship low so more of the path ahead (toward the stargate) stays visible.
    this.cameras.main.startFollow(this.ship, true, 0.16, 0.14);
    this.cameras.main.setFollowOffset(0, 220);
    this.cameras.main.setDeadzone(28, 48);

    this.buildHud();
    beginRun(this.state, { advance: false });
    this.refreshHud();
    this.flashBanner(this.attackPassLabel());
    this.startBgm();
    this.events.once("shutdown", () => this.stopBgm());
  }

  startBgm() {
    if (!this.cache.audio.exists("bgm-play")) return;
    this.stopBgm();
    this.bgm = this.sound.add("bgm-play", { loop: true, volume: 0.4 });
    const play = () => {
      if (this.bgm && !this.bgm.isPlaying) this.bgm.play();
    };
    if (this.sound.locked) this.sound.once("unlocked", play);
    else play();
  }

  stopBgm() {
    if (!this.bgm) return;
    this.bgm.stop();
    this.bgm.destroy();
    this.bgm = null;
  }

  playHitSfx() {
    if (!this.cache.audio.exists("sfx-explosion")) return;
    this.sound.play("sfx-explosion", { volume: 0.55 });
  }

  update(_time, delta) {
    if (!this.ship || this.transitioning || this.state?.outcome) return;

    this.laserCd = Math.max(0, this.laserCd - delta);
    this.bombCd = Math.max(0, this.bombCd - delta);
    this.invuln = Math.max(0, this.invuln - delta);
    const shipAlpha =
      this.invuln > 0 && Math.floor(this.invuln / 80) % 2 === 0 ? 0.35 : 1;
    this.ship.setAlpha(shipAlpha);
    if (this.flame) this.flame.setAlpha(shipAlpha);

    this.updateShip();
    this.updateWeapons();
    this.updateEnemyFire(delta);
    this.steerMissiles();
    this.cullProjectiles();
    this.checkPassComplete();
  }

  drawBackdrop(worldW, worldH) {
    this.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x070b14);
    const stars = Math.floor((worldW * worldH) / 12000);
    for (let i = 0; i < stars; i += 1) {
      const x = Phaser.Math.Between(0, worldW);
      const y = Phaser.Math.Between(0, worldH);
      this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.7), 0xcbd5e1, 0.55);
    }
    this.add.rectangle(worldW / 2, 48, worldW, 28, 0x22d3ee, 0.12).setDepth(1);
    this.add
      .text(worldW / 2, 48, "STARGATE", {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "13px",
        color: "#67e8f9",
      })
      .setOrigin(0.5)
      .setDepth(1);
  }

  drawHull(dn) {
    const L = dn.length;
    const W = dn.hullWidth;
    const cx = dn.centerX;
    const slices = 48;
    const sliceH = L / slices + 2;

    // Tip at bottom (narrow), stern at top (full width).
    for (let i = 0; i < slices; i += 1) {
      const t = (i + 0.5) / slices;
      const y = dn.tipY - t * L;
      const w = Math.max(12, W * t);
      const shade = i % 2 === 0 ? 0x3d5168 : 0x334155;
      this.add.rectangle(cx, y, w, sliceH, shade).setDepth(2);
    }

    this.spawnEngineThrusters(dn);

    this.add
      .text(cx, dn.sternY + 36, dn.name.toUpperCase(), {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5, 0)
      .setDepth(5);
  }

  spawnEngineThrusters(dn) {
    for (const engine of dn.components.filter((c) => c.kind === "engine")) {
      const outer = this.add.rectangle(engine.x, dn.sternY, 36, 26, 0xf59e0b, 0.55);
      outer.setDepth(4);
      const core = this.add.rectangle(engine.x, dn.sternY, 20, 14, 0xfbbf24, 0.65);
      core.setDepth(4);
      this.engineThrusters.set(engine.id, { outer, core });
    }
  }

  darkenEngineThruster(engineId) {
    const thruster = this.engineThrusters.get(engineId);
    if (!thruster) return;
    thruster.outer.setFillStyle(0x334155, 0.3);
    thruster.core.setFillStyle(0x1e293b, 0.2);
  }

  spawnComponents(dn) {
    for (const c of dn.components) {
      const sprite = this.compGroup.create(c.x, c.y, `comp-${c.kind}`);
      sprite.setData("id", c.id);
      sprite.setDepth(8);
      sprite.refreshBody();
      this.compSprites.set(c.id, sprite);
    }
  }

  strike(sprite, weapon, projectile) {
    const id = sprite.getData("id");
    const component = this.state.dreadnaught.components.find((c) => c.id === id);
    if (!component?.alive) return;
    if (component.weapon !== weapon) return;

    projectile.destroy();
    const result = damageComponent(this.state, id);
    if (!result) return;

    this.playHitSfx();
    if (result.destroyed) {
      sprite.setTexture(`comp-${component.kind}-dead`);
      sprite.disableBody(true, false);
      sprite.setAlpha(0.55);
      if (component.kind === "engine") this.darkenEngineThruster(id);
    } else {
      this.tweens.add({
        targets: sprite,
        alpha: 0.4,
        yoyo: true,
        duration: 70,
        repeat: 2,
      });
    }

    this.refreshHud();
    if (this.state.outcome === "destroyed") this.endRun();
  }

  hitPlayer(shot, amount) {
    if (this.invuln > 0 || this.transitioning) return;
    shot.destroy();
    this.playHitSfx();
    applyDamage(this.state, amount);
    this.invuln = 1400;
    this.cameras.main.shake(180, 0.01);
    this.refreshHud();
    if (this.state.damage <= 0) this.fighterDestroyed();
  }

  fighterDestroyed() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.ship.setVelocity(0, 0);
    this.clearProjectiles();
    this.flashBanner("FIGHTER DESTROYED", 1200);

    this.time.delayedCall(1500, () => {
      beginRun(this.state, { nextFighter: true });
      if (this.state.outcome) {
        this.endRun();
        return;
      }
      const dn = this.state.dreadnaught;
      this.ship.setPosition(dn.centerX, dn.tipY + dn.approachLead - SPAWN_MARGIN);
      this.speed = START_SPEED;
      this.invuln = 2200;
      this.refreshHud();
      this.flashBanner(this.attackPassLabel(), 1000);
      this.transitioning = false;
    });
  }

  clearProjectiles() {
    this.lasers.clear(true, true);
    this.bombs.clear(true, true);
    this.bolts.clear(true, true);
    this.missiles.clear(true, true);
  }

  updateShip() {
    // ↑ faster climb, ↓ slower. Forward is always toward the stargate (smaller y).
    if (keys.up) this.speed += 4;
    if (keys.down) this.speed -= 4;
    this.speed = Phaser.Math.Clamp(this.speed, MIN_SPEED, MAX_SPEED);
    this.ship.setVelocityY(-this.speed);

    let vx = 0;
    if (keys.left) vx = -STRAFE_SPEED;
    else if (keys.right) vx = STRAFE_SPEED;
    this.ship.setVelocityX(vx);
    this.updateFlame();
  }

  updateFlame() {
    if (!this.flame || !this.ship) return;
    this.flame.setPosition(this.ship.x, this.ship.y + 20);
    const thrust = (this.speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
    this.flame.setScale(0.75 + thrust * 0.35, 0.55 + thrust * 0.85);
  }

  updateWeapons() {
    const fireLaser = keys.z || keys.space;
    const fireBomb = keys.x || keys.shift;

    if (fireLaser && this.laserCd <= 0) {
      this.laserCd = LASER_COOLDOWN;
      if (this.cache.audio.exists("sfx-laser")) {
        this.sound.play("sfx-laser", { volume: 0.45 });
      }
      const shot = this.lasers.create(this.ship.x, this.ship.y - 28, "laser");
      shot.setAngle(-90);
      shot.setVelocity(0, -520);
      shot.setDepth(15);
      const fadeTimer = this.time.delayedCall(LASER_LIFETIME, () => {
        if (!shot.active) return;
        this.tweens.add({
          targets: shot,
          alpha: 0,
          duration: LASER_FADE,
          onComplete: () => shot.destroy(),
        });
      });
      shot.once("destroy", () => fadeTimer.remove(false));
    }

    if (fireBomb && this.bombCd <= 0) {
      this.bombCd = BOMB_COOLDOWN;
      if (this.cache.audio.exists("sfx-bomb")) {
        this.sound.play("sfx-bomb", { volume: 0.5 });
      }
      const bomb = this.bombs.create(this.ship.x, this.ship.y - 28, "bomb");
      bomb.setVelocity(0, -220);
      bomb.setDepth(15);
      const fuse = this.time.delayedCall(2000, () => {
        if (bomb.active) this.explodeBomb(bomb);
      });
      bomb.setData("fuse", fuse);
      bomb.once("destroy", () => fuse.remove(false));
    }
  }

  explodeBomb(bomb) {
    const { x, y } = bomb;
    bomb.destroy();
    this.playHitSfx();
    const blast = this.add.circle(x, y, 6, 0xfbbf24, 0.9).setDepth(16);
    this.tweens.add({
      targets: blast,
      scale: 4,
      alpha: 0,
      duration: 220,
      onComplete: () => blast.destroy(),
    });
  }

  updateEnemyFire(delta) {
    const interval = this.state.skill.fireIntervalMs / this.state.fireRateMul;
    const cam = this.cameras.main.worldView;

    for (const gun of this.state.dreadnaught.components) {
      if (!gun.alive || !gun.fires) continue;
      if (
        gun.x <= cam.x - 40 ||
        gun.x >= cam.x + cam.width + 40 ||
        gun.y <= cam.y - 40 ||
        gun.y >= cam.y + cam.height + 80
      ) {
        continue;
      }

      gun.fireAcc = (gun.fireAcc ?? 0) + delta;
      if (gun.fireAcc < interval) continue;
      gun.fireAcc = 0;

      if (gun.fires === "missile") this.fireMissile(gun);
      else if (gun.fires === "bolt") this.fireBolt(gun);
    }
  }

  fireBolt(gun) {
    const b = this.bolts.create(gun.x, gun.y + 16, "bolt");
    const aim = this.leadBoltAim(gun.x, gun.y);
    const angle = Phaser.Math.Angle.Between(gun.x, gun.y, aim.x, aim.y);
    this.physics.velocityFromRotation(angle, BOLT_SPEED, b.body.velocity);
    b.setDepth(12);
  }

  fireMissile(gun) {
    const m = this.missiles.create(gun.x, gun.y + 18, "missile");
    m.setDepth(12);
    m.setData("tracking", true);
  }

  /** Intercept aim — solves when the bolt meets the ship; falls back to direct fire. */
  leadBoltAim(gunX, gunY) {
    const px = this.ship.x - gunX;
    const py = this.ship.y - gunY;
    const vx = this.ship.body.velocity.x;
    const vy = this.ship.body.velocity.y;
    const s = BOLT_SPEED;
    const a = vx * vx + vy * vy - s * s;
    const b = 2 * (px * vx + py * vy);
    const c = px * px + py * py;
    let t = null;

    if (Math.abs(a) < 1e-4) {
      if (Math.abs(b) > 1e-4) t = -c / b;
    } else {
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const root = Math.sqrt(disc);
        const t1 = (-b - root) / (2 * a);
        const t2 = (-b + root) / (2 * a);
        if (t1 > 0 && t2 > 0) t = Math.min(t1, t2);
        else if (t1 > 0) t = t1;
        else if (t2 > 0) t = t2;
      }
    }

    if (t == null || t <= 0) {
      return { x: this.ship.x, y: this.ship.y };
    }

    return {
      x: this.ship.x + vx * t,
      y: this.ship.y + vy * t,
    };
  }

  steerMissiles() {
    this.missiles.children.iterate((m) => {
      if (!m) return;
      const angle = Phaser.Math.Angle.Between(m.x, m.y, this.ship.x, this.ship.y);
      this.physics.velocityFromRotation(angle, 150, m.body.velocity);
      m.setRotation(angle);
    });
  }

  cullProjectiles() {
    const cam = this.cameras.main;
    const killOffscreen = (group) => {
      group.children.iterate((p) => {
        if (!p) return;
        const offX = Math.abs(p.x - cam.scrollX - VIEW_W / 2) > VIEW_W * 1.2;
        const offY = Math.abs(p.y - cam.scrollY - VIEW_H / 2) > VIEW_H * 1.2;
        if (offX || offY) p.destroy();
      });
    };
    killOffscreen(this.lasers);
    killOffscreen(this.bombs);
    killOffscreen(this.bolts);
    killOffscreen(this.missiles);
  }

  checkPassComplete() {
    // Cleared the stern into the stargate zone (toward the top of the world).
    if (this.ship.y > this.state.dreadnaught.sternY - 50) return;
    this.transitioning = true;
    this.ship.setVelocity(0, 0);
    this.clearProjectiles();

    beginRun(this.state);
    this.refreshHud();

    if (this.state.outcome) {
      this.endRun();
      return;
    }

    this.cameras.main.fadeOut(220, 5, 8, 16);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      const dn = this.state.dreadnaught;
      this.ship.setPosition(dn.centerX, dn.tipY + dn.approachLead - SPAWN_MARGIN);
      this.speed = START_SPEED;
      this.cameras.main.fadeIn(280, 5, 8, 16);
      this.transitioning = false;
      this.flashBanner(this.attackPassLabel());
    });
  }

  attackPassLabel() {
    return `ATTACK PASS ${this.state.pass} · FIGHTER ${this.state.fighter}`;
  }

  endRun() {
    this.transitioning = true;
    this.ship.setVelocity(0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start("ResultScene", {
        outcome: this.state.outcome,
        score: this.state.score,
        pass: this.state.pass,
      });
    });
  }

  buildHud() {
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(50);
    const bar = this.add.rectangle(VIEW_W / 2, 28, VIEW_W, 56, 0x020617, 0.78);
    this.hudText = this.add.text(14, 10, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#e2e8f0",
      lineSpacing: 3,
    });
    this.help = this.add
      .text(VIEW_W / 2, VIEW_H - 18, "←→ align   ↑ faster   ↓ slower   Z laser   X bomb", {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: "13px",
        color: "#64748b",
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(50);
    this.hud.add([bar, this.hudText]);
  }

  refreshHud() {
    const h = hudSnapshot(this.state);
    const fire = h.fireRateMul < 1 ? "BRIDGES DOWN · 50% fire" : "bridges intact";
    this.hudText.setText(
      `SCORE ${String(h.score).padStart(6, "0")}  F${h.fighter}  DAMAGE ${h.damage}/${h.maxDamage}  PASS ${h.pass}  RANGE ${h.range.toFixed(1)}/${h.maxRange}\n` +
        `VENTS ${h.vents}/${h.ventsMax}  SILOS ${h.silos}/${h.silosMax}  ENGINES ${h.engines}/${h.enginesMax}  ${fire}`,
    );
  }

  flashBanner(msg, holdMs = 700) {
    const t = this.add
      .text(VIEW_W / 2, 110, msg, {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "20px",
        color: "#f8fafc",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60);
    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: holdMs,
      duration: 400,
      onComplete: () => t.destroy(),
    });
  }
}
