// import Phaser from "phaser";
// import planck from "planck-js";
/* eslint-disable */

let game;
let platforms;
let player;
let cursors;
let p1;
let p1health = 10;
let p1score = 0;
let p2;
let p2health = 10;
let p2healthBar = 10;
let p2score = 0;
let p1grid = [];
let p2grid = [];
let block;
let gridWidth = 4;
let gridHeight = 1;
let gridSize = 32;
let offset = { x: gridSize * 6, y: gridSize * 2 };
let p1wordArray = [];
let p1wordArrayPersist = [];
let p2wordArray = [];
let p2wordArrayPersist = [];
let p1word;
let p2word;
let keysPressed = {};
let articleContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque bibendum augue scelerisque justo tempor, quis congue eros faucibus. Sed tristique, turpis in interdum accumsan, turpis massa vulputate augue, quis consequat lacus mauris ac erat. Proin mollis eleifend lectus, in ornare orci. Maecenas in hendrerit massa, sit amet tincidunt nibh. Nulla ornare justo ut dapibus sollicitudin. Aliquam vel maximus nisl, eu pellentesque diam. Duis feugiat sapien id facilisis posuere. Mauris id bibendum nulla, nec semper arcu. Pellentesque arcu augue, congue vel nibh ac, dictum condimentum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam non nulla laoreet, venenatis ex at, pellentesque sapien. Vivamus a erat sit amet massa pulvinar aliquet. Maecenas rutrum ante purus, vel accumsan tellus imperdiet a.";
articleContent = articleContent
  .replace(/[^\w\']|_/g, "")
  .toLowerCase()
  .substring(0, 100);
let articleContentArray = [...articleContent];

let gameOptions = {
  // world scale to convert Box2D meters to pixels
  worldScale: 30,

  gameGravity: 8,

  // amount of letters when the game starts
  startingLetters: 16,

  // letter size, in pixels
  letterSize: 60,

  // delay between two letters, in mmilliseconds
  letterDelay: 1500,
};

export default class PlayGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  preload() {
    // import english words
    // thank you dwyl! - https://github.com/dwyl/english-words
    this.load.crossOrigin = "Access-Control-Allow-Origin: *";
    this.load.json(
      "words",
      "https://client-side-dictionary.s3.amazonaws.com/words_dictionary.json"
    );
    this.load.spritesheet(
      "dude",
      "https://sticks-and-stones-assets.s3.us-east-2.amazonaws.com/dude.png",
      { frameWidth: 32, frameHeight: 48 }
    );
    this.load.image(
      "ground",
      "https://sticks-and-stones-assets.s3.us-east-2.amazonaws.com/platform.png"
    );
  }

  create() {
    this.sound.play("music", { loop: false, delay: 2 });
    // import json object into a variable
    this.data = this.cache.json.get("words");
    // world gravity, as a Vec2 object. It's just a x, y vector
    let gravity = planck.Vec2(0, 8);

    // this is how we create a Box2D world
    this.world = planck.World(gravity);
    platforms = this.physics.add.staticGroup();
    platforms
      .create(window.width / 2, window.height, "ground")
      .setScale(5)
      .refreshBody();

    //build walls for arena
    this.createPlatform(0, window.height / 2, 20, window.height, 0, 0, 0);
    this.createPlatform(
      window.width,
      window.height / 2,
      20,
      window.height,
      0,
      0,
      0
    );

    //build ground
    this.createPlatform(
      window.width / 2,
      window.height,
      window.width,
      200,
      46,
      139,
      87
    );

    //build water
    this.createPlatform(
      window.width / 2,
      window.height,
      window.width,
      window.height * 0.05,
      30,
      144,
      255
    );

    let p1healthBar = this.makeBar(
      window.width * 0.1,
      window.height * 0.5,
      0xe74c3c
    );
    this.setValue(p1healthBar, 20);
    let p2healthOutline = this.makeBar(
      window.width * 0.8,
      window.height * 0.5,
      0x808080
    );
    p2health = 20;
    this.setValue(p2healthOutline, 20);
    p2healthBar = this.makeBar(
      window.width * 0.8,
      window.height * 0.5,
      0xe74c3c
    );
    this.setValue(p2healthBar, 20);

    //this.player = new Player(this);
    p1 = this.physics.add.sprite(offset.x * 1.4, 450, "dude").setFlipX(true);
    p2 = this.physics.add.sprite(window.width - offset.x * 1.5, 450, "dude");
    //   p1 = this.physics.add.sprite(window.width - 300, 450, "dude");
    //   p2 = this.physics.add.sprite(250, 450, "dude");
    p1.setCollideWorldBounds(true);
    p2.setCollideWorldBounds(true);

    //player bounce
    this.tweens.add({
      targets: p1,
      props: {
        scaleX: { value: 0.9, duration: 250 },
        scaleY: { value: 1.1, duration: 250 },
      },
      ease: "Sine.easeInOut",
      repeat: -1,
      yoyo: true,
    });

    this.tweens.add({
      targets: p2,
      props: {
        scaleX: { value: 0.9, duration: 250 },
        scaleY: { value: 1.1, duration: 250 },
      },
      ease: "Sine.easeInOut",
      repeat: -1,
      yoyo: true,
    });

    // collide the player and the platform
    this.physics.add.collider(p1, platforms);
    this.physics.add.collider(p2, platforms);

    let ox = offset.x;
    let oy = offset.y;

    let gw = gridWidth;
    let gh = gridHeight;

    let size = gridSize;

    this.addGrids(ox, gw, gh, size);

    this.block = this.add
      .rectangle(
        ox + size * 2,
        oy + (this.currentY - 1) * size,
        size - 1,
        size - 1,
        0x99ffff
      )
      .setOrigin(0);

    //   for (var y = 0; y < gh; y++) {
    //     this.p1grid.push([0, 0, 0, 0]);
    //     this.p2grid.push([0, 0, 0, 0]);
    //   }

    this.scoreText = this.add.text(140, 2, this.score, {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#ffffff",
    });

    // createBox is a method I wrote to create a box, see how it works at line 55
    // arguments: x, y coordinates of the center, width and height of the box, in pixels
    //bottom wall
    this.createBox(
      window.width / 2,
      window.height / 3,
      window.width / 1.4,
      window.height * 0.05,
      false
    );
    //left wall
    this.createBox(200, 40, window.height * 0.05, window.height * 0.6, false);
    //right wall
    this.createBox(
      window.width - 200,
      40,
      window.height * 0.05,
      window.height * 0.6,
      false
    );

    this.textGenerator = this.time.addEvent({
      delay: 200,
      callbackScope: this,
      callback: function () {
        this.createBox(
          Phaser.Math.Between(300, window.width - 300),
          -100,
          gameOptions.letterSize,
          gameOptions.letterSize,
          true,
          articleContentArray.shift()
        );
      },
      repeat: articleContent.length - 1,
    });

    // text to display the word
    this.wordText = this.add.text(window.width / 2, window.height - 80, "", {
      fontFamily: "Arial",
      fontSize: "64px",
      color: "#FFFFFF",
    });
    this.wordText.setOrigin(0.5);

    //instructions
    let instructions = [
      "Type a word and press enter",
      "Press <-^-> to build your wall",
      "Press ctrl + <-^-> to attack other player",
      "Press ` to mute audio",
    ];

    this.add
      .text(window.width / 2.5, window.height / 2, instructions, {
        fontFamily: "bebas",
        fontSize: 30,
        color: "#ffffff",
        lineSpacing: 6,
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    // input listener
    this.input.keyboard.on("keydown", this.writeWord, this);
    this.input.keyboard.on("keydown", this.useWord, this);
    this.input.keyboard.on("keydown", this.muteAudio, this);
    this.input.keyboard.on("keyup", this.keyUp, this);
    //this.input.keyboard.on('keydown', this.drop, this);
  }

  makeBar(x, y, color) {
    //draw the bar
    let bar = this.add.graphics();

    //color the bar
    bar.fillStyle(color, 1);

    //fill the bar with a rectangle
    bar.fillRect(0, 0, 200, 50);

    //position the bar
    bar.x = x;
    bar.y = y;

    //return the bar
    return bar;
  }

  scaleBar(bar, value) {
    p2health = p2health - value;
    if (p2health > 0) {
      //scale the bar
      bar.scaleX = p2health / 20;
    } else {
      this.setValue(p2healthBar, 0);
    }
  }

  setValue(bar, percentage) {
    //scale the bar
    bar.scaleX = percentage / 20;
  }

  addGrids(ox, gw, gh, size) {
    //p1 walls
    //top
    this.add
      .grid(
        ox,
        window.height - 180,
        gw * size,
        gh * size,
        size,
        size,
        0x999999,
        1,
        0x666666
      )
      .setOrigin(0);
    //left
    this.add
      .grid(
        ox,
        window.height - 180,
        gh * size,
        gw * size,
        size,
        size,
        0x999999,
        1,
        0x666666
      )
      .setOrigin(0);
    //right
    this.add
      .grid(
        ox + gw * size,
        window.height - 180,
        gh * size,
        gw * size,
        size,
        size,
        0x999999,
        1,
        0x666666
      )
      .setOrigin(0);

    //p2 walls
    //top
    this.add
      .grid(
        window.width - ox * 1.9,
        window.height - 180,
        gw * size,
        gh * size,
        size,
        size,
        0x999999,
        1,
        0x666666
      )
      .setOrigin(0);
    //left
    this.add
      .grid(
        window.width - ox * 1.9,
        window.height - 180,
        gh * size,
        gw * size,
        size,
        size,
        0x999999,
        1,
        0x666666
      )
      .setOrigin(0);
    //right
    this.add
      .grid(
        window.width - ox * 1.9 + gw * size,
        window.height - 180,
        gh * size,
        gw * size,
        size,
        size,
        0x999999,
        1,
        0x666666
      )
      .setOrigin(0);
  }

  drop() {}

  nextRow() {}

  writeWord(event) {
    //   console.log("P1 Score: ", this.p1score);
    //13 is Enter, 32 is Spacebar
    if (event.keyCode == (13 || 32)) {
      if (this.checkWord()) {
        console.log(this.wordText.text, " is a word");
        this.sendWord();
        // this.p1score += this.wordText.text.length * 10;
        // this.scoreText.setText(this.p1score);
        this.wordText.color = "#00FF00";

        // delete the word
        this.wordText.text = "";

        // loop through all bodies
        // for (
        //   let body = this.world.getBodyList();
        //   body;
        //   body = body.getNext()
        // ) {
        //   // get body userData
        //   let userData = body.getUserData();

        //   // if the body sprite is semi transparent...
        //   if (userData.sprite.alpha == 0.25) {
        //     // destroy the sprite
        //     userData.sprite.destroy();

        //     // destroy the letter
        //     userData.letter.destroy();

        //     // destroy the body itself
        //     this.world.destroyBody(body);
        //   }
        // }
      } else {
        console.log(this.wordText.text, " is NOT a word");
        this.wordText.setColor("#ff0000");
        this.resetLetters();
      }
    }
    //any other letter keypress
    if (
      (event.keyCode >= 65 && event.keyCode <= 90) ||
      (event.keyCode >= 97 && event.keyCode <= 122)
    ) {
      this.findLetter(event, this);
    }
  }

  findLetter(event) {
    // loop through all bodies
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      // loop through all fixtures
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        let letter = fixture?.m_body?.m_userData?.letter?._text;
        if (letter) {
          if (letter.toLowerCase() == event.key.toLowerCase()) {
            let userData = body.getUserData();

            // if the sprite is fully opaque and the body is dynamic (this means it's a letter)
            if (userData.sprite.alpha == 1 && body.isDynamic()) {
              // set the sprite to semi transparent
              userData.sprite.alpha = 0.25;
              userData.sprite.p1Claim = "true";
              //this.playerWord.push(userData);
              // update text string
              this.wordText.text += userData.letter.text.toLowerCase();
              return;
            }
          }
        }
      }
    }
  }

  sendWord() {
    // create box on p1 side
    this.createBox(
      100,
      0,
      gameOptions.letterSize * 2.5,
      gameOptions.letterSize,
      true,
      this.wordText.text
    );

    p1wordArray.push(this.wordText.text);
    p1wordArrayPersist.push(this.wordText.text);
    console.log("persistant array: ", p1wordArrayPersist);

    // loop through all bodies
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      // get body userData
      let userData = body.getUserData();

      // if the body sprite is semi transparent...
      if (userData.sprite.plclaim) {
        // destroy the sprite
        userData.sprite.destroy();

        // destroy the letter
        userData.letter.destroy();

        // destroy the body itself
        this.world.destroyBody(body);
      }
    }
  }

  useWord(event) {
    if (p1wordArray?.length > 0) {
      keysPressed[event.keyCode] = true;

      // ctrl + right attack player's right
      if (keysPressed[17] && event.keyCode == 39) {
        this.updatePlatform("ctrl-right");
      } else if (event.keyCode == 39) {
        this.updatePlatform("right");
      }
      // ctrl + left attack player's left
      if (keysPressed[17] && event.keyCode == 37) {
        this.updatePlatform("ctrl-left");
      } else if (event.keyCode == 37) {
        this.updatePlatform("left");
      }
      // ctrl + up attack player's up
      if (keysPressed[17] && event.keyCode == 38) {
        this.updatePlatform("ctrl-up");
      } else if (event.keyCode == 38) {
        this.updatePlatform("up");
      }
    }
  }

  keyUp(event) {
    keysPressed[event.keyCode] = false;
  }

  updatePlatform(direction) {
    let wall;
    let word;
    let num;
    switch (direction) {
      case "right":
        word = p1wordArray[0];
        if (this.getBody("name", direction)) {
          console.log("wall exists");
          wall = this.getBody("name", direction).getUserData();
          wall.strength.text =
            Number(wall.strength.text) + p1wordArray.shift().length;
        } else {
          this.createPlatform(
            offset.x * 1.08 + gridWidth * gridSize,
            window.height * 0.88,
            gridHeight * gridSize,
            gridWidth * gridSize,
            250,
            128,
            114,
            "right"
          );
          wall = this.getBody("name", direction).getUserData();
          num = this.add.text(
            offset.x * 1.08 + gridWidth * gridSize,
            window.height * 0.88,
            p1wordArray.shift().length,
            {
              fontFamily: "Arial",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }
          );
          num.setOrigin(0.5, 0.5);
          wall.strength = num;
          //wall.setUserData(wall);
        }
        this.destroyWord("letter", word);
        break;
      case "left":
        word = p1wordArray[0];
        if (this.getBody("name", direction)) {
          wall = this.getBody("name", direction).getUserData();
          wall.strength.text =
            Number(wall.strength.text) + p1wordArray.shift().length;
        } else {
          this.createPlatform(
            offset.x * 1.08,
            window.height * 0.88,
            gridHeight * gridSize,
            gridWidth * gridSize,
            250,
            128,
            114,
            "left"
          );
          wall = this.getBody("name", direction).getUserData();
          num = this.add.text(
            offset.x * 1.08,
            window.height * 0.88,
            p1wordArray.shift().length,
            {
              fontFamily: "Arial",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }
          );
          num.setOrigin(0.5, 0.5);
          wall.strength = num;
          //wall.setUserData(wall);
        }
        this.destroyWord("letter", word);
        break;
      case "up":
        word = p1wordArray[0];
        if (this.getBody("name", direction)) {
          wall = this.getBody("name", direction).getUserData();
          wall.strength.text =
            Number(wall.strength.text) + p1wordArray.shift().length;
        } else {
          this.createPlatform(
            offset.x * 1.416,
            window.height * 0.829,
            gridWidth * gridSize * 1.24,
            gridHeight * gridSize,
            250,
            128,
            114,
            "up"
          );
          wall = this.getBody("name", direction).getUserData();
          num = this.add.text(
            offset.x * 1.416,
            window.height * 0.829,
            p1wordArray.shift().length,
            {
              fontFamily: "Arial",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }
          );
          num.setOrigin(0.5, 0.5);
          wall.strength = num;
          //wall.setUserData(wall);
        }
        this.destroyWord("letter", word);
        break;
      case "ctrl-right":
        word = p1wordArray[0];
        this.attackPlayer(word.length);
        if (this.getBody("name", direction)) {
          wall = this.getBody("name", direction).getUserData();
          wall.strength.text =
            Number(wall.strength.text) - p1wordArray.shift().length;
        } else {
          this.createPlatform(
            window.width - offset.x * 1.82 + gridWidth * gridSize,
            window.height * 0.88,
            gridHeight * gridSize,
            gridWidth * gridSize,
            250,
            128,
            114,
            "ctrl-right"
          );
          wall = this.getBody("name", direction).getUserData();
          num = this.add.text(
            window.width - offset.x * 1.82 + gridWidth * gridSize,
            window.height * 0.88,
            0 - p1wordArray.shift().length,
            {
              fontFamily: "Arial",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }
          );
          num.setOrigin(0.5, 0.5);
          wall.strength = num;
          //wall.setUserData(wall);
        }
        this.destroyWord("letter", word);
        break;
      case "ctrl-left":
        word = p1wordArray[0];
        this.attackPlayer(word.length);
        if (this.getBody("name", direction)) {
          wall = this.getBody("name", direction).getUserData();
          wall.strength.text =
            Number(wall.strength.text) - p1wordArray.shift().length;
        } else {
          this.createPlatform(
            window.width - offset.x * 1.82,
            window.height * 0.88,
            gridHeight * gridSize,
            gridWidth * gridSize,
            250,
            128,
            114,
            "ctrl-left"
          );
          wall = this.getBody("name", direction).getUserData();
          num = this.add.text(
            window.width - offset.x * 1.82,
            window.height * 0.88,
            0 - p1wordArray.shift().length,
            {
              fontFamily: "Arial",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }
          );
          num.setOrigin(0.5, 0.5);
          wall.strength = num;
          //wall.setUserData(wall);
        }
        this.destroyWord("letter", word);
        break;
      case "ctrl-up":
        word = p1wordArray[0];
        this.attackPlayer(word.length);
        if (this.getBody("name", direction)) {
          wall = this.getBody("name", direction).getUserData();
          wall.strength.text =
            Number(wall.strength.text) - p1wordArray.shift().length;
        } else {
          this.createPlatform(
            window.width - offset.x * 1.488,
            window.height * 0.829,
            gridWidth * gridSize * 1.24,
            gridHeight * gridSize,
            250,
            128,
            114,
            "ctrl-up"
          );
          wall = this.getBody("name", direction).getUserData();
          num = this.add.text(
            window.width - offset.x * 1.488,
            window.height * 0.829,
            0 - p1wordArray.shift().length,
            {
              fontFamily: "Arial",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }
          );
          num.setOrigin(0.5, 0.5);
          wall.strength = num;
          //wall.setUserData(wall);
        }
        this.destroyWord("letter", word);
        break;
    }
  }

  attackPlayer(value) {
    this.scaleBar(p2healthBar, value);
  }

  checkWord() {
    return this.wordText.text in this.data &&
      !p1wordArrayPersist.includes(this.wordText.text)
      ? true
      : false;
  }

  resetLetters() {
    this.wordText.text = "";
    // loop through all bodies
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      // loop through all fixtures
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        // get body userData
        let userData = body.getUserData();

        // if the sprite is fully opaque and the body is dynamic (this means it's a letter)
        if (userData.sprite.alpha == 0.25 && body.isDynamic()) {
          // set the sprite to semi transparent
          userData.sprite.alpha = 1;
        }
      }
    }
  }

  getBody(key, value) {
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      // loop through all fixtures
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        // get body userData
        let userData = body.getUserData();

        if (userData[key] == value) {
          return body;
        }
      }
    }
    return false;
  }

  destroyWord(key, value) {
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      // loop through all fixtures
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        // get body userData
        let userData = body.getUserData();

        // console.log("userData[key]._text: ", userData?.letter?._text);
        let word = userData?.letter?._text;
        if (word) {
          if (word.toLowerCase() == value.toLowerCase()) {
            // destroy the sprite
            userData.sprite.destroy();

            // destroy the letter
            userData.letter.destroy();

            // destroy the body itself
            this.world.destroyBody(body);
          }
        }
      }
    }
  }

  // simple function to convert pixels to meters
  toWorldScale(n) {
    return n / gameOptions.worldScale;
  }

  // here we go with some Box2D stuff
  // arguments: x, y coordinates of the center, width and height of the box, in pixels
  // we'll convert pixels to meters inside the method
  createBox(posX, posY, width, height, isDynamic, char) {
    // this is how we create a generic Box2D body
    let box = this.world.createBody();
    if (isDynamic) {
      // Box2D bodies born as static bodies, but we can make them dynamic
      box.setDynamic();
    }

    // a body can have one or more fixtures. This is how we create a box fixture inside a body
    box.createFixture(
      planck.Box(
        width / 2 / gameOptions.worldScale,
        height / 2 / gameOptions.worldScale
      )
    );

    // now we place the body in the world
    box.setPosition(
      planck.Vec2(posX / gameOptions.worldScale, posY / gameOptions.worldScale)
    );

    // time to set mass information
    box.setMassData({
      mass: 1,
      center: planck.Vec2(),

      // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
      I: 1,
    });

    // now we create a graphics object representing the body
    let color = new Phaser.Display.Color();

    // draw the square
    let debugDraw = this.add.graphics();

    // a box has no letter by default
    let letter = null;

    // if isDynamic is set to true
    if (isDynamic) {
      // assign the box a random letter
      letter = this.add.text(
        0,
        0,
        //   String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        char.toUpperCase(),
        {
          fontFamily: "Arial",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#000000",
        }
      );
      letter.setOrigin(0.5);

      // assign the box a random color
      color.random();
      color.brighten(50).saturate(100);
    }

    // if isDynamic is set to true, assign the box a grey color
    else {
      color.setTo(128, 128, 128);
    }

    // draw the rectangle
    debugDraw.fillStyle(color.color, 1);
    debugDraw.fillRect(-width / 2, -height / 2, width, height);

    // set box user data
    let userData = {
      sprite: debugDraw,
      letter: letter,
    };

    // a body can have anything in its user data, normally it's used to store its sprite
    box.setUserData(userData);
  }

  createPlatform(posX, posY, width, height, r, g, b, name) {
    // this is how we create a generic Box2D body
    let box = this.world.createBody();

    // a body can have one or more fixtures. This is how we create a box fixture inside a body
    box.createFixture(
      planck.Box(
        width / 2 / gameOptions.worldScale,
        height / 2 / gameOptions.worldScale
      )
    );

    // now we place the body in the world
    box.setPosition(
      planck.Vec2(posX / gameOptions.worldScale, posY / gameOptions.worldScale)
    );

    // time to set mass information
    box.setMassData({
      mass: 1,
      center: planck.Vec2(),

      // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
      I: 0,
    });

    // now we create a graphics object representing the body
    let color = new Phaser.Display.Color();

    // draw the square
    let debugDraw = this.add.graphics();
    color.setTo(r, g, b);

    // draw the rectangle
    debugDraw.fillStyle(color.color, 1);
    debugDraw.fillRect(-width / 2, -height / 2, width, height);

    // set box user data
    let userData = {
      sprite: debugDraw,
    };

    if (name) {
      userData.name = name;
    }

    // a body can have anything in its user data, normally it's used to store its sprite
    box.setUserData(userData);
  }

  start() {
    // player.start();
  }

  update() {
    // advance the simulation by 1/20 seconds
    this.world.step(1 / 30);

    // crearForces  method should be added at the end on each step
    this.world.clearForces();

    // iterate through all bodies
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      // get body position
      let bodyPosition = body.getPosition();

      // get body angle, in radians
      let bodyAngle = body.getAngle();

      // get body user data, the graphics object
      let userData = body.getUserData();

      // adjust graphic object position and rotation
      userData.sprite.x = bodyPosition.x * gameOptions.worldScale;
      userData.sprite.y = bodyPosition.y * gameOptions.worldScale;
      userData.sprite.rotation = bodyAngle;

      // if there is a letter on the box...
      if (userData.letter) {
        // adjust letter position and rotation
        userData.letter.x = userData.sprite.x;
        userData.letter.y = userData.sprite.y;
        userData.letter.rotation = bodyAngle;
      }
    }
  }

  muteAudio(event) {
    if (event.keyCode == 192) {
      this.sound.mute = !this.sound.mute;
    }
  }
}
