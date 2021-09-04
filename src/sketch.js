import party from "party-js"
import * as MoralisSDK from 'moralis'

// bg
import graveyardBGPath from './vendor/assets/bg/graveyard.png'
import desertBGPath from './vendor/assets/bg/graveyard.png'
import forestBGPath from './vendor/assets/bg/graveyard.png'
import winterBGPath from './vendor/assets/bg/graveyard.png'

// sounds
import successSoundPath from './vendor/assets/sounds/success.mp3'
import popSoundPath from './vendor/assets/sounds/pop.mp4'


// init moralis
const moralisAppID = process.env.MORALIS_APPLICATION_ID || ''
const moralisServerUrl = process.env.MORALIS_SERVER_URL || ''
const Moralis = MoralisSDK.default
Moralis.initialize(moralisAppID)
Moralis.serverURL = moralisServerUrl

// fetch and setup player SVG
const numericTraits = [1, 5, 99, 29, 6, 8]
const equippedWearables = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const renderTraits = () => {
  const gotchiTraitsDiv = document.getElementById('gotchi-traits')
  const numericTraitsNames = ['⚡️ Energy', '👹 Aggression', '👻 Spookiness', '🧠 Brain size']
  let traits = ''
  numericTraits.slice(0, 4).forEach((_, i) => {
    traits += `<li class="list-group-item"><span>${numericTraitsNames[i]}</span> <span>${i}</span></li>`
  })
  gotchiTraitsDiv.innerHTML = `<ul class="list-group">${traits}</ul>`
}

const setupPlayerSVG = async () => {
  const rawSVG = await Moralis.Cloud.run("getSVG", { numericTraits: numericTraits, equippedWearables: equippedWearables })
  const removeBG = (svg) => {
    const styledSvg = svg.replace("<style>", "<style>.gotchi-bg,.wearable-bg{display: none}");
    return styledSvg;
  };
  const rawSVGNoBG = removeBG(rawSVG)
  const svgStrBase64 = window.btoa(rawSVGNoBG)
  const svgDataUri = `data:image/svg+xml;base64,${svgStrBase64}`

  const aavegotchiPreview = document.getElementById('aavegotchi-preview')
  aavegotchiPreview.src = svgDataUri
  renderTraits()
  return svgDataUri
}

let score = 0;

const setupSketch = async () => {
  const svgDataUri = await setupPlayerSVG()
  const canvasParent = document.getElementById('main-canvas')

  let gotchiImg, graveyardBG;
  let successSound, popSound;
  const gotchiSize = 80

  const loadAssetsFn = () => {
    gotchiImg = window.loadImage(svgDataUri)

    successSound = new Audio(successSoundPath)
    successSound.volume = 0.5
    popSound = new Audio(popSoundPath)
    popSound.volume = 0.2

    graveyardBG = window.loadImage(graveyardBGPath)
  }

  window.preload = () => {
    loadAssetsFn()
  }

  class Gotchi {
    constructor(x, y) {
      this.x = x
      this.y = y - 50
      this.speed = 3
    }

    draw() {
      image(gotchiImg, this.x, this.y, gotchiSize, gotchiSize)
    }

    moveUp() {
      // Moving up at a constant speed
      this.y -= this.speed
      // Reset to the bottom
      // if top was reached
      if (this.y < 0) {
        // WIN
        // trigger confetti
        score += 1
        document.getElementById('user-score').innerHTML = score
        party.confetti(canvasParent)
        successSound.play()
        // reset to beginning
        this.y = getHeight() - 50;
      }
    }
  }

  function getHeight() {
    return height - 25
  }

  const w = window.innerWidth / 1.3
  const h = window.innerHeight / 1.3

  function drawLadder() {
    fill(81, 1, 176);
    const rectWidth = 80
    rect((w / 2) - rectWidth / 2, 0, 80, h - 90);
  }

  function drawBackground() {
    noStroke();
    background(graveyardBG);
  }

  let gotchi

  // needs to be defined in window for bundler
  window.setup = () => {
    console.log('setup p5js sketch')
    const sketchCanvas = createCanvas(w, h - 90);
    sketchCanvas.parent("main-canvas");

    // init gotchi
    let x = (w / 2) - (gotchiSize / 2);
    let y = getHeight() - 9;
    gotchi = new Gotchi(x, y)
  }

  // needs to be defined in window for bundler
  window.draw = () => {
    drawBackground()

    drawLadder()

    if (window.gameState) {
      gotchi.draw()

      if (window.gameStateIsInMove()) {
        gotchi.moveUp()
        popSound.play()
      }
    }
  }
}

// init sketch
setupSketch()

