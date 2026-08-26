import * as PhaserNS from "phaser";

const Phaser = PhaserNS.Scene ? PhaserNS : PhaserNS.default;

if (!Phaser?.Game || !Phaser?.Scene) {
  throw new Error("Phaser failed to load. Expected Game and Scene exports.");
}

export default Phaser;
