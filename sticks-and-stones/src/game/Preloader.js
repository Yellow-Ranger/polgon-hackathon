/* eslint-disable */
export default class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.load.crossOrigin = "Access-Control-Allow-Origin: *";
    this.load.atlas(
      "sprites",
      "https://sticks-and-stones-assets.s3.us-east-2.amazonaws.com/sprites.png",
      "https://sticks-and-stones-assets.s3.us-east-2.amazonaws.com/sprites.json"
    );

    //  Audio ...

    this.load.audio(
      "music",
      "https://sticks-and-stones-assets.s3.us-east-2.amazonaws.com/Di+Young+-+Pixel+Pig.mp3"
    );
  }

  create() {
    //  Create our global animations

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("sprites", {
        prefix: "idle",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      yoyo: true,
      frameRate: 8,
      repeat: -1,
    });

    this.scene.start("PlayGame");
  }
}
