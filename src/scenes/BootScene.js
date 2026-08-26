import Phaser from "../engine.js";
import { generateTextures } from "../textures.js";
import { setLaunchVisible } from "../ui.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    generateTextures(this);
    setLaunchVisible(true);
    this.scene.start("MenuScene");
  }
}
