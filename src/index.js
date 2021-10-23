import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
// import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-cpu';
import { getAngleBetween, getAnglesBetween } from './angles';
import { STATE } from './params';
import { Camera } from './camera';

// TODO wasm is much faster investigate why
// + vendor the dist
const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
console.log('registering wasm backend', wasmPath)
tfjsWasm.setWasmPaths(wasmPath);

// const video = document.getElementById('video')
// const canvas = document.getElementById('video-output')

let ctx, poseDetector;

const setupCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': { facingMode: 'user' },
    })
    video.srcObject = stream

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

let moved = false
const renderPrediction = async () => {
    if (camera.video.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(video);
            };
        });
    }

    ctx = camera.ctx

    // pose detection
    let poses;
    try {
        poses = await poseDetector.estimatePoses(camera.video)
    } catch (error) {
        poseDetector.dispose();
        poseDetector = null;
        alert(error);
    }

    camera.drawCtx();

    const drawLine = (p1, p2) => {
        camera.ctx.beginPath();
        camera.ctx.moveTo(p1[0], p1[1])
        camera.ctx.lineTo(p2[0], p2[1]);
        camera.ctx.stroke();
    }

    if (poses && poses.length > 0) {
        camera.drawResults(poses);
    }

    if (poses && poses.length > 0) {
        // camera.drawResults(poses);
        const poseKeypoints = poses[0].keypoints

        const nose = poseKeypoints[0]

        // path from nose to right end
        drawLine([nose.x, nose.y], [0, nose.y])

        // path from nose to left end
        const videoWidth = video.videoWidth
        drawLine([nose.x, nose.y], [videoWidth, nose.y])

        const leftEye = poseKeypoints[1]
        const rightEye = poseKeypoints[2]

        const left_ear = poseKeypoints[3]
        const right_ear = poseKeypoints[4]

        const left_shoulder = poseKeypoints[5]
        const right_shoulder = poseKeypoints[6]

        const left_elbow = poseKeypoints[7]
        const right_elbow = poseKeypoints[8]

        const left_wrist = poseKeypoints[9]
        const right_wrist = poseKeypoints[10]

        const leftElbowToSholder = getAngleBetween(left_shoulder, left_elbow)
        const rightElbowToSholder = getAngleBetween(right_shoulder, right_elbow)

        const elbowsAboveNose = left_elbow["y"] > nose["y"] || right_elbow["y"] > nose["y"]

        const angle = 40
        const oneOfArmsOrBothUp = (leftElbowToSholder > angle) || (rightElbowToSholder > angle)

        const bothArmsUp = (leftElbowToSholder > angle) && (rightElbowToSholder > angle)

        const [noseToLeftEyeAngle, noseToRightEyeAngle] =
            getAnglesBetween([nose.x, nose.y], [leftEye.x, leftEye.y],
                [rightEye.x, rightEye.y])

        // console.log('noseToLeftEyeAngle', noseToLeftEyeAngle, noseToRightEyeAngle)

        const noseYToLEyeY = nose.y - leftEye.y
        const noseYToREyeY = nose.y - rightEye.y

        if (noseYToLEyeY < 5) {
            window.gameStateMoveLeft()
            camera.ctx.fillStyle = "red";
            console.log('LEFT')
        } else if (noseYToREyeY < 5) {
            window.gameStateMoveRight()
            camera.ctx.fillStyle = "yellow";
            console.log('RIGHT')
        } else if (bothArmsUp) {
            moved = true
            window.gameStateMoveJump()
            camera.ctx.fillStyle = "blue";
        } else {
            if (moved) {
                if (!oneOfArmsOrBothUp) {
                    moved = false
                }
                window.gameStateStop()
            } else {
                if (oneOfArmsOrBothUp) {
                    moved = true
                    window.gameStateMoveJump()
                    camera.ctx.fillStyle = "blue";
                } else {
                    moved = false
                    window.gameStateStop()
                    camera.ctx.fillStyle = "white";
                }
            }

        }


    }
    requestAnimationFrame(renderPrediction)
}

let camera;

const setupGame = async () => {
    camera = await Camera.setupCamera(STATE.camera);

    // await setupCamera()
    console.log('setupCamera finished')
    // video.play()
    await tf.setBackend('wasm')
    console.log('tfjs backend loaded wasm')

    // const videoWidth = video.videoWidth
    // const videoHeight = video.videoHeight
    // video.width = videoWidth
    // video.height = videoHeight

    // canvas.width = videoWidth
    // canvas.height = videoHeight

    const welcomBg = document.getElementById('welcom-bg')
    welcomBg.style.display = 'none'
    const mainCanvas = document.getElementById('main-canvas')
    mainCanvas.style.display = 'block'

    const videoOutput = document.getElementById('video-output')
    videoOutput.style.display = 'block'

    // ctx = canvas.getContext('2d')
    // ctx.fillStyle = "rgba(255, 0, 0, 0.5)"

    poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });

    renderPrediction()
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => setupGame())
