import Phaser from "../engine.js";
import { generateTextures } from "../textures.js";
import { setLaunchVisible } from "../ui.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.audio("bgm-play", "assets/audio/blackout-circuit.mp3");
  }

  create() {
    generateTextures(this);
    setLaunchVisible(true);
    this.scene.start("MenuScene");
  }
}
