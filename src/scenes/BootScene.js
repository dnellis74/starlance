import Phaser from "../engine.js";
import { generateTextures } from "../textures.js";
import { setLaunchVisible } from "../ui.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.audio("bgm-play", "assets/audio/blackout-circuit.mp3");
    this.load.audio("sfx-explosion", "assets/audio/explosion.wav");
    this.load.audio("sfx-engage", "assets/audio/synth.wav");
    this.load.audio("sfx-laser", "assets/audio/laserShoot.wav");
    this.load.audio("sfx-bomb", "assets/audio/bomb.wav");
  }

  create() {
    generateTextures(this);
    setLaunchVisible(true);
    this.scene.start("MenuScene");
  }
}
