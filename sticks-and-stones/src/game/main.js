/* eslint-disable */
import Preloader from "./Preloader.js";
import PlayGame from "./PlayGame.js";
// import React from "react";
// import Phaser from "phaser";
// import { IonPhaser } from "@ion-phaser/react";

// game = new Phaser.Game(gameConfig);
// class Game extends React.Component {
class Game {
  state = {
    initialize: true,
    gameConfig: {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "thegame",
        width: window.innerWidth,
        height: window.innerHeight,
      },
      scene: [Preloader, PlayGame],
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
    },
  };

  render() {
    const { initialize, gameConfig } = this.state;
    return <IonPhaser game={gameConfig} initialize={initialize} />;
  }
}

export default Game;
