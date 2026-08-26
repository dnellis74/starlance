import Phaser from "./engine.js";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { BriefingScene } from "./scenes/BriefingScene.js";
import { PlayScene } from "./scenes/PlayScene.js";
import { ResultScene } from "./scenes/ResultScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#02040a",
  autoFocus: false,
  banner: false,
  disableContextMenu: true,
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 540,
    height: 960,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, BriefingScene, PlayScene, ResultScene],
};

const game = new Phaser.Game(config);
window.game = game;

function launchFromDom(event) {
  event.preventDefault();
  event.stopPropagation();
  if (game.scene.isActive("PlayScene")) return;
  if (game.scene.isActive("BriefingScene")) {
    game.scene.getScene("BriefingScene").advance();
    return;
  }
  if (game.scene.isActive("ResultScene")) {
    game.scene.start("MenuScene");
    return;
  }
  const menu = game.scene.getScene("MenuScene");
  menu.startGame();
}

document.getElementById("launch")?.addEventListener("click", launchFromDom);
document.getElementById("launch")?.addEventListener("pointerup", launchFromDom);
