import Phaser from "../engine.js";
import { keys } from "../keys.js";
import { WEAPON } from "../data/kinds.js";
import { setLaunchVisible } from "../ui.js";
import {
  createGameState,
  damageComponent,
  completePass,
  loseLife,
  hudSnapshot,
} from "../state/gameState.js";

const VIEW_W = 960;
const VIEW_H = 540;
const MIN_SPEED = 70;
const MAX_SPEED = 300;
const START_SPEED = 155;
const SPAWN_X = 80;
const LASER_COOLDOWN = 140;
const BOMB_COOLDOWN = 420;

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
          wordWrap: { width: 900 },
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
    this.compGroup = this.physics.add.staticGroup();
    this.lasers = this.physics.add.group();
    this.bombs = this.physics.add.group();
    this.bolts = this.physics.add.group();
    this.missiles = this.physics.add.group();

    const dn = this.state.dreadnaught;
    const worldW = dn.endX + 720;
    const worldH = dn.worldHeight;
    this.worldH = worldH;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    this.drawBackdrop(worldW, worldH);
    this.drawHull(dn);
    this.spawnComponents(dn);

    const hullMidY = dn.hullY + dn.hullHeight / 2;
    // Start far left of the tip; approachLead (~800px) gives a few seconds of open space.
    this.ship = this.physics.add.sprite(SPAWN_X, hullMidY, "ship");
    this.ship.setDepth(20);
    this.ship.body.setSize(36, 14);
    this.ship.setCollideWorldBounds(true);

    this.physics.add.overlap(this.lasers, this.missiles, (laser, missile) => {
      laser.destroy();
      missile.destroy();
      this.state.score += 25;
      this.refreshHud();
    });
    this.physics.add.overlap(this.lasers, this.bolts, (laser, bolt) => {
      laser.destroy();
      bolt.destroy();
    });
    this.physics.add.overlap(this.lasers, this.compGroup, (laser, sprite) => {
      this.strike(sprite, WEAPON.laser, laser);
    });
    this.physics.add.overlap(this.bombs, this.compGroup, (bomb, sprite) => {
      this.strike(sprite, WEAPON.bomb, bomb);
    });
    this.physics.add.overlap(this.ship, this.bolts, (_, shot) => this.hitPlayer(shot));
    this.physics.add.overlap(this.ship, this.missiles, (_, shot) => this.hitPlayer(shot));

    this.cameras.main.startFollow(this.ship, true, 0.14, 0.16);
    this.cameras.main.setFollowOffset(-200, 0);
    this.cameras.main.setDeadzone(40, 36);

    this.buildHud();
    this.refreshHud();
    this.flashBanner("ATTACK PASS 1");
  }

  update(_time, delta) {
    if (!this.ship || this.transitioning || this.state?.outcome) return;

    this.laserCd = Math.max(0, this.laserCd - delta);
    this.bombCd = Math.max(0, this.bombCd - delta);
    this.invuln = Math.max(0, this.invuln - delta);
    this.ship.setAlpha(this.invuln > 0 && Math.floor(this.invuln / 80) % 2 === 0 ? 0.35 : 1);

    this.updateShip();
    this.updateWeapons();
    this.updateEnemyFire(delta);
    this.steerMissiles();
    this.cullProjectiles();
    this.checkPassComplete();
  }

  drawBackdrop(worldW, worldH) {
    this.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x070b14);
    const stars = Math.floor((worldW * worldH) / 14000);
    for (let i = 0; i < stars; i += 1) {
      const x = Phaser.Math.Between(0, worldW);
      const y = Phaser.Math.Between(0, worldH);
      this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.7), 0xcbd5e1, 0.55);
    }
    this.add.rectangle(worldW - 70, worldH / 2, 22, worldH, 0x22d3ee, 0.1).setDepth(1);
    this.add
      .text(worldW - 86, 48, "STARGATE", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#67e8f9",
      })
      .setAngle(90)
      .setOrigin(0, 0)
      .setDepth(1)
      .setScrollFactor(1);
  }

  drawHull(dn) {
    const L = dn.length;
    const H = dn.hullHeight;
    const cy = dn.hullY + H / 2;
    const slices = 48;
    const sliceW = L / slices + 2;

    // Tip on the left (narrow), stern on the right (full height).
    for (let i = 0; i < slices; i += 1) {
      const t = (i + 0.5) / slices;
      const x = dn.originX + t * L;
      const h = Math.max(12, H * t);
      const shade = i % 2 === 0 ? 0x3d5168 : 0x334155;
      this.add.rectangle(x, cy, sliceW, h, shade).setDepth(2);
    }

    // Engine glow at the wide stern (right).
    const glow = this.add.graphics().setDepth(4);
    glow.setPosition(dn.endX, dn.hullY);
    glow.fillStyle(0xf59e0b, 0.55);
    for (let i = 0; i < 4; i += 1) {
      const y = 110 + i * ((H - 220) / 3);
      glow.fillRect(-8, y - 18, 26, 36);
    }

    this.add
      .text(dn.endX - 220, dn.hullY + 24, dn.name.toUpperCase(), {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#94a3b8",
      })
      .setDepth(5);
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

    if (result.destroyed) {
      sprite.setTexture(`comp-${component.kind}-dead`);
      sprite.disableBody(true, false);
      sprite.setAlpha(0.55);
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

    if (this.state.outcome === "destroyed") {
      this.endRun();
    }
  }

  hitPlayer(shot) {
    if (this.invuln > 0 || this.transitioning) return;
    shot.destroy();
    loseLife(this.state);
    this.invuln = 1400;
    this.cameras.main.shake(180, 0.01);
    this.refreshHud();
    if (this.state.outcome === "gameOver") {
      this.endRun();
    }
  }

  updateShip() {
    if (keys.right) this.speed += 4;
    if (keys.left) this.speed -= 4;
    this.speed = Phaser.Math.Clamp(this.speed, MIN_SPEED, MAX_SPEED);

    // Forward-only: horizontal velocity is always positive; left/right only change speed.
    this.ship.setVelocityX(this.speed);

    let vy = 0;
    if (keys.up) vy = -260;
    else if (keys.down) vy = 260;
    this.ship.setVelocityY(vy);
  }

  updateWeapons() {
    const fireLaser = keys.z || keys.space;
    const fireBomb = keys.x || keys.shift;

    if (fireLaser && this.laserCd <= 0) {
      this.laserCd = LASER_COOLDOWN;
      const shot = this.lasers.create(this.ship.x + 28, this.ship.y, "laser");
      shot.setVelocity(520, 0);
      shot.setDepth(15);
    }

    if (fireBomb && this.bombCd <= 0) {
      this.bombCd = BOMB_COOLDOWN;
      // Deviation: original bombs dropped onto the hull. These are slow forward
      // shots with a slight drop so they still read as heavier ordinance.
      const bomb = this.bombs.create(this.ship.x + 18, this.ship.y + 6, "bomb");
      bomb.setVelocity(220, 40);
      bomb.setDepth(15);
    }
  }

  updateEnemyFire(delta) {
    const interval = this.state.skill.fireIntervalMs / this.state.fireRateMul;
    this._fireAcc = (this._fireAcc ?? 0) + delta;
    if (this._fireAcc < interval) return;
    this._fireAcc = 0;

    const cam = this.cameras.main.worldView;
    const shooters = this.state.dreadnaught.components.filter(
      (c) =>
        c.alive &&
        c.fires &&
        c.x > cam.x - 40 &&
        c.x < cam.x + cam.width + 80 &&
        c.y > this.ship.y - 260 &&
        c.y < this.ship.y + 260,
    );
    Phaser.Utils.Array.Shuffle(shooters);
    const volley = shooters.slice(0, 2);
    for (const gun of volley) {
      if (gun.fires === "missile") {
        const m = this.missiles.create(gun.x, gun.y - 18, "missile");
        m.setDepth(12);
        m.setData("tracking", true);
      } else {
        const b = this.bolts.create(gun.x, gun.y - 16, "bolt");
        const angle = Phaser.Math.Angle.Between(gun.x, gun.y, this.ship.x, this.ship.y);
        this.physics.velocityFromRotation(angle, 180, b.body.velocity);
        b.setDepth(12);
      }
    }
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
    if (this.ship.x < this.state.dreadnaught.endX + 50) return;
    this.transitioning = true;
    this.ship.setVelocity(0, 0);

    // Deviation from the original re-approach loop: instead of a separate
    // outbound cinematic, we fade, snap the interceptor back ahead of the tip,
    // and immediately begin the next pass after the dreadnaught advances.
    completePass(this.state);
    this.refreshHud();

    if (this.state.outcome) {
      this.endRun();
      return;
    }

    this.cameras.main.fadeOut(220, 5, 8, 16);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      const dn = this.state.dreadnaught;
      this.ship.setPosition(SPAWN_X, dn.hullY + dn.hullHeight / 2);
      this.speed = START_SPEED;
      this.cameras.main.fadeIn(280, 5, 8, 16);
      this.transitioning = false;
      this.flashBanner(`ATTACK PASS ${this.state.pass}`);
    });
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
    const bar = this.add.rectangle(VIEW_W / 2, 22, VIEW_W, 44, 0x020617, 0.72);
    this.hudText = this.add.text(16, 8, "", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#e2e8f0",
      lineSpacing: 3,
    });
    this.help = this.add
      .text(VIEW_W - 16, VIEW_H - 18, "↑↓ align   ← slower   → faster   Z laser   X bomb", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#64748b",
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(50);
    this.hud.add([bar, this.hudText]);
  }

  refreshHud() {
    const h = hudSnapshot(this.state);
    const fire = h.fireRateMul < 1 ? "BRIDGES DOWN · 50% fire" : "bridges intact";
    this.hudText.setText(
      `SCORE ${String(h.score).padStart(6, "0")}   LIVES ${h.lives}   PASS ${h.pass}   RANGE ${h.range.toFixed(1)} / ${h.maxRange}\n` +
        `VENTS ${h.vents}/${h.ventsMax}   SILOS ${h.silos}/${h.silosMax}   ENGINES ${h.engines}/${h.enginesMax}   ${fire}`,
    );
  }

  flashBanner(msg) {
    const t = this.add
      .text(VIEW_W / 2, 80, msg, {
        fontFamily: "sans-serif",
        fontSize: "22px",
        color: "#f8fafc",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60);
    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 700,
      duration: 400,
      onComplete: () => t.destroy(),
    });
  }
}
