import Phaser from "phaser";

// tiles
import ladderPath from "./vendor/assets/tiles/ladder.png";

// bg
import graveyardBGPath from './vendor/assets/bg/graveyard.png'
import desertBGPath from './vendor/assets/bg/desert.png'
import forestBGPath from './vendor/assets/bg/forest.png'
import winterBGPath from './vendor/assets/bg/winter.png'

// sounds
import successSoundPath from './vendor/assets/sounds/success.mp3'
import popSoundPath from './vendor/assets/sounds/pop.mp4'

let cursors = []
let player


const backGrounds = new Map([
    ["graveyard", graveyardBGPath],
    ["desert", desertBGPath],
    ["forest", forestBGPath],
    ["winter", winterBGPath]])

let bgs = [...backGrounds.keys()]
let level = 0
let successSound, popSound;

var gamePlay = new Phaser.Class({
    // Define scene
    Extends: Phaser.Scene,
    initialize: function GamePlay() {
        Phaser.Scene.call(this, { key: "GamePlay" });
    },

    /*--- THE PRELOAD FUNCTION: LOAD THE ASSETS ---*/
    preload: function () {
        // sounds
        successSound = new Audio(successSoundPath)
        successSound.volume = 0.5
        popSound = new Audio(popSoundPath)
        popSound.volume = 0.2

        // Preload images
        backGrounds.forEach((path, name) => this.load.image(name, path))
        this.load.image(
            "ladder",
            ladderPath
        );
        this.load.spritesheet(
            "dude",
            "https://raw.githubusercontent.com/cattsmall/Phaser-game/5-2014-game/assets/dude.png",
            {
                frameWidth: 32,
                frameHeight: 48
            }
        );
    },

    /*--- THE CREATE FUNCTION: SET UP THE SCENE ON LOAD ---*/
    updateSrites: function () {
        // Create background
        this.bg = this.add.image(config.width / 2, config.height / 2, bgs[level]);
        this.bg.setDisplaySize(config.width, config.height);
        // draw ladders
        let ladderCount = 3
        let ladderY = config.height - 200
        for (let i = ladderCount; i--;) {
            let curLadder = this.add.image(config.width / 2, ladderY, 'ladder')
                .setScale(0.1)
            ladderY = ladderY - curLadder.displayHeight
        }
        // Create player
        player = this.physics.add.sprite(config.width / 2, config.height - 32, "dude");
    },

    create: function () {
        console.log('config', config)
        this.updateSrites()
        // Create animations for player
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 3 })
        });
        // Keyboard input
        cursors = this.input.keyboard.createCursorKeys();
    },

    /*--- THE UPDATE FUNCTION: MAKE CHANGES TO THE GAME OVER TIME ---*/

    update: function () {
        // Update objects & variables
        const scored = player.y <= 0
        if (scored) {
            level = (level + 1) % bgs.length
            this.updateSrites()
        }
        player.setVelocity(0, 0);
        if (cursors.up.isDown) {
            //  Move up
            player.setVelocityY(-200);
            player.anims.play("up");
        }
    }
});

/*--- CONFIG + RUNNING THE GAME ---*/

//Define the game config once everything else is defined
const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile

var config = {
    type: Phaser.AUTO,
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight,
    parent: 'main-canvas',
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: gamePlay,
    debug: true
};

//Instantiate the game with the config
const game = new Phaser.Game(config);
