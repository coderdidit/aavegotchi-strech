import Phaser from "phaser";
import party from "party-js"

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

let player
const canvasParent = document.getElementById('main-canvas')
const gotchiSize = 90

const backGrounds = new Map([
    ["graveyard", graveyardBGPath],
    ["desert", desertBGPath],
    ["forest", forestBGPath],
    ["winter", winterBGPath]])

let bgs = [...backGrounds.keys()]
let level = 0
let successSound, popSound

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>`;

const gamePlay = new Phaser.Class({
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
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        this.load.svg('gotchi', url)
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
        player = this.physics.add.sprite(config.width / 2, config.height - 32, "gotchi");
    },

    create: function () {
        this.updateSrites()
    },

    /*--- THE UPDATE FUNCTION: MAKE CHANGES TO THE GAME OVER TIME ---*/

    update: function () {
        // Update objects & variables
        const scored = player.y <= 0
        if (scored) {
            level = (level + 1) % bgs.length
            this.updateSrites()
            party.confetti(canvasParent)
            successSound.play()
        }
        player.setVelocity(0, 0);
        if (window.gameStateIsInMove()) {
            //  Move up
            player.setVelocityY(-200);
            player.anims.play("up");
            popSound.play()
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
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
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
