import Phaser from "../engine.js";
import { gameanalytics } from "gameanalytics";
import { getDifficulty } from "../difficulty.js";

const { GameAnalytics } = gameanalytics;
const { EGAProgressionStatus } = gameanalytics;

const GAME_KEY = __GA_GAME_KEY__;
const SECRET_KEY = __GA_SECRET_KEY__;

function isWin(outcome) {
  return outcome === "destroyed" || outcome === "neutralized";
}

export class GameAnalyticsPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.initialized = false;
  }

  start() {
    if (!GAME_KEY || !SECRET_KEY) {
      if (import.meta.env.DEV) {
        console.warn("[GameAnalytics] Missing GA_GAME_KEY or GA_SECRET_KEY");
      }
      return;
    }

    GameAnalytics.setEnabledInfoLog(import.meta.env.DEV);
    GameAnalytics.configureBuild(import.meta.env.MODE);
    GameAnalytics.initialize(GAME_KEY, SECRET_KEY);
    this.initialized = true;

    this.game.scene.events.on(Phaser.Scenes.Events.START, this.onSceneStart, this);
  }

  onSceneStart(scene) {
    if (!this.initialized) return;

    const key = scene.sys.settings.key;
    GameAnalytics.addDesignEvent(`scene:${key}`);

    if (key === "PlayScene") {
      GameAnalytics.addProgressionEvent(
        EGAProgressionStatus.Start,
        getDifficulty(),
        "run",
      );
    }
  }

  trackDesign(eventId, value) {
    if (!this.initialized) return;
    if (value !== undefined) {
      GameAnalytics.addDesignEvent(eventId, value);
    } else {
      GameAnalytics.addDesignEvent(eventId);
    }
  }

  trackRunResult(outcome, pass, damage) {
    if (!this.initialized) return;

    const difficulty = getDifficulty();
    const status = isWin(outcome)
      ? EGAProgressionStatus.Complete
      : EGAProgressionStatus.Fail;

    GameAnalytics.addProgressionEvent(status, difficulty, "run");
    GameAnalytics.addDesignEvent(`result:${outcome}:pass${pass}`);
    if (typeof damage === "number") {
      GameAnalytics.addDesignEvent("result:damage", damage);
    }
  }
}
