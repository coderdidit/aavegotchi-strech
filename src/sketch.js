import party from "party-js"
// import svgPath from "./vendor/icon/aavegotchi.svg"

const canvasParent = document.getElementById('main-canvas')

let img;
const gotchiSize = 80

const svgStrRaw = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M44,58H19v1h1v1h24v-1h1v-1H44z" opacity=".25" enable-background="new"/><path d="M47 14v-2h-2v-2h-4V8h-4V6H27v2h-4v2h-4v2h-2v2h-2v41h4v-2h5v2h5v-2h6v2h5v-2h5v2h4V14z" fill="#64438e"/><path d="M45 14v-2h-4v-2h-4V8H27v2h-4v2h-4v2h-2v39h2v-2h5v2h5v-2h6v2h5v-2h5v2h2V14z" fill="#edd3fd"/><path d="M18,49h2v-1h2v1h2v2h5v-2h2v-1h2v1h2v2h5v-2h2v-1h2v1h1V14h-4v-2h-4v-2h-5V9h-5v2h-4v2h-4v2h-1V49z" fill="#fff"/><path d="M23 28v2h4v-2h2v-4h-2v-2h-4v2h-2v4h2zm12-4v4h2v2h4v-2h2v-4h-2v-2h-4v2h-2z" fill="#64438e"/><path d="M21 32v2h2v-2h-2zm20 0v2h2v-2h-2z" fill="#f696c6"/><g fill="#64438e"><path d="M29,32h-2v2h2V32z"/><path d="M29,34v2h6v-2H29z"/><path d="M35 32v2h2v-2h-2zm0-17v-1h-1v-1h-1v-1h-2v1h-1v1h-1v1h-1v4h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-4z"/></g><g fill="#dea8ff"><path d="M29,17v2h1v1h1v1h1v-4H29z"/><path d="M34,15v-1h-1v-1h-1v4h3v-2H34z"/></g><path d="M32,17v4h1v-1h1v-1h1v-2H32z" fill="#c260ff"/><path d="M31,13v1h-1v1h-1v2h3v-4H31z" fill="#edd3fd"/><path d="M8 38v-1h2v-1h2v-1h1v-1h1v-1h1v8h-1v1h-2v1H8v-1H7v-4z" fill="#64438e"/><path d="M10 38v-1h2v-1h1v-1h1v-1h1v6h-1v1h-2v1H8v-4z" fill="#edd3fd"/><path d="M8,38v3h4v-1h2v-1h1v-5h-1v1h-1v1h-1v1h-2v1H8z" fill="#fff"/><path d="M56 38v-1h-2v-1h-2v-1h-1v-1h-1v-1h-1v8h1v1h2v1h4v-1h1v-4z" fill="#64438e"/><path d="M54 38v-1h-2v-1h-1v-1h-1v-1h-1v6h1v1h2v1h4v-4z" fill="#edd3fd"/><path d="M54,38v-1h-2v-1h-1v-1h-1v-1h-1v5h1v1h2v1h4v-3H54z" fill="#fff"/></svg>'
const svgStrBase64 = window.btoa(svgStrRaw)
const svgDataUri = `data:image/svg+xml;base64,${svgStrBase64}`

const loadImgFn = () => {
  img = window.loadImage(svgDataUri)
  console.log('image loaded', img)
}

window.preload = () => {
  loadImgFn()
}

class Ball {
  constructor(x, y) {
    this.x = x
    this.y = y - 50
    this.speed = 1.8
  }

  draw() {
    image(img, this.x, this.y, gotchiSize, gotchiSize)
  }

  moveUp() {
    // Moving up at a constant speed
    this.y -= this.speed
    // Reset to the bottom
    // if top was reached
    if (this.y < 0) {
      // trigger confetti
      party.confetti(canvasParent)
      // reset to beginning
      this.y = getHeight();
    }
  }
}

function getHeight() {
  return height - 25
}

function drawLadder() {
  fill(81, 1, 176);
  const rectWidth = 80
  rect((window.innerWidth / 2) - rectWidth / 2, 0, 80, window.innerHeight - 90);
}

function drawBackground() {
  noStroke();
  background(18, 2, 47);
}

let ball

// needs to be defined in window for bundler
window.setup = () => {
  console.log('setup p5js sketch')
  var sketchCanvas = createCanvas(window.innerWidth, window.innerHeight - 90);
  sketchCanvas.parent("main-canvas");

  // init ball
  let x = (window.innerWidth / 2) - (gotchiSize / 2);
  let y = getHeight() - 9;
  ball = new Ball(x, y)
}

// needs to be defined in window for bundler
window.draw = () => {
  drawBackground()

  drawLadder()

  if (window.gameState) {
    ball.draw()

    if (window.gameStateIsInMove()) {
      ball.moveUp()
    }
  }
}
