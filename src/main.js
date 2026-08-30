import Phaser from "./engine.js";
import { GameAnalyticsPlugin } from "./analytics/gameAnalyticsPlugin.js";
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
    activePointers: 4,
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
  plugins: {
    global: [
      {
        key: "GameAnalyticsPlugin",
        plugin: GameAnalyticsPlugin,
        start: true,
      },
    ],
  },
};

const game = new Phaser.Game(config);
window.game = game;
