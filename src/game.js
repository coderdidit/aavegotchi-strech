import Phaser from "phaser";
import ladderPath from "./vendor/assets/tiles/ladder.png";

let cursors = []
let player

let bgs = ["sky", "sky2"]
let level = 0

var gamePlay = new Phaser.Class({
    // Define scene
    Extends: Phaser.Scene,
    initialize: function GamePlay() {
        Phaser.Scene.call(this, { key: "GamePlay" });
    },

    /*--- THE PRELOAD FUNCTION: LOAD THE ASSETS ---*/

    preload: function () {
        // Preload images
        this.load.image(
            "sky",
            "https://raw.githubusercontent.com/cattsmall/Phaser-game/5-2014-game/assets/sky.png"
        );
        this.load.image(
            "sky2",
            "https://4.bp.blogspot.com/-KNRLf5CeP7w/UieET_1_KGI/AAAAAAAAO4Y/ltB8sK9lSGM/s1600/Sprite_background_effects_0022.png"
        );
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

    create: function () {
        // Create background
        this.backgroundSprite = this.add.image(config.width / 2, config.height / 2, "sky");

        // ladder
        this.add.image(config.width / 2, config.height - 150, 'ladder').setScale(0.1)
        this.add.image(config.width / 2, 25, 'ladder').setScale(0.1)

        // Create player
        player = this.physics.add.sprite(config.width / 2, config.height - 32, "dude");

        // Create animations for player
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 3 })
        });

        // Player should collide with edges of the screen
        // player.setCollideWorldBounds(true);

        // Keyboard input
        cursors = this.input.keyboard.createCursorKeys();
    },

    /*--- THE UPDATE FUNCTION: MAKE CHANGES TO THE GAME OVER TIME ---*/

    update: function () {
        // Update objects & variables
        // reset
        if (player.y <= 0) {
            level += 1
            const nextBgIdx = level % bgs.length
            console.log('nextBgIdx', nextBgIdx)
            const nextBgName = bgs[nextBgIdx]
            // Create background
            this.backgroundSprite = this.add.image(config.width / 2, config.height / 2, nextBgName);
            // ladder
            this.add.image(config.width / 2, config.height - 150, 'ladder').setScale(0.1)
            this.add.image(config.width / 2, 25, 'ladder').setScale(0.1)
            // Create player
            player = this.physics.add.sprite(config.width / 2, config.height - 32, "dude");
        }
        player.setVelocity(0, 0);
        if (cursors.up.isDown) {
            //  Move up
            player.setVelocityY(-150);
            player.anims.play("up");
        }
    }
});

/*--- CONFIG + RUNNING THE GAME ---*/

//Define the game config once everything else is defined
var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
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
