console.log(haarcascade_frontalface_alt)
let wasmWorker = new Worker('wasm-worker.js');
let jsWorker = new Worker('js-worker.js');
let asmWorker = new Worker('asm-worker.js');

let ctxWasm, ctxAsm, ctxJS;
let canvasWidth, canvasHeight;
let img = new Image();

function detectFace() {
  startWasmWorker(ctxWasm.getImageData(0, 0, canvasWidth, canvasHeight), 'faceDetect');
  // startAsmWorker(ctxAsm.getImageData(0, 0, canvasWidth, canvasHeight), 'faceDetect');
  // startJSWorker(ctxJS.getImageData(0, 0, canvasWidth, canvasHeight), 'faceDetect');

}

function detectEyes() {
  startWasmWorker(ctxWasm.getImageData(0, 0, canvasWidth, canvasHeight), 'eyesDetect');
  startAsmWorker(ctxAsm.getImageData(0, 0, canvasWidth, canvasHeight), 'eyesDetect');
  startJSWorker(ctxJS.getImageData(0, 0, canvasWidth, canvasHeight), 'eyesDetect');
}


function startWasmWorker(imageData, command) {
  let message = { cmd: command, img: imageData };

  wasmWorker.postMessage(message);
}

function startAsmWorker(imageData, command) {
  let message = { cmd: command, img: imageData };

  asmWorker.postMessage(message);
}

function startJSWorker(imageData, command) {
  let message = { cmd: command, img: imageData, imgRaw: JSON.stringify(img) };
  console.log(`message data: ${message.imgRaw}`)
  jsWorker.postMessage(message);
}

function updateCanvas(e, id) {
  let data = e.data.data; 	// output is a Uint8Array that aliases directly into the Emscripten heap

  channels = e.data.channels;
  channelSize = e.data.channelSize;

  let canvas = document.getElementById(id);

  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = e.data.width;
  canvas.height = e.data.height;

  imdata = ctx.createImageData(canvas.width, canvas.height);

  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    imdata.data[j] = data[i];
    imdata.data[j + 1] = data[i + 1 % channels];
    imdata.data[j + 2] = data[i + 2 % channels];
    imdata.data[j + 3] = 255;
  }
  ctx.putImageData(imdata, 0, 0);
}

function updateCanvasJS(e) {
  e.forEach(square => {
    ctxJS.strokeRect(square.x, square.y, square.width, square.height);
  });
}

wasmWorker.onmessage = function (e) {
  updateCanvas(e, 'canvas-wasm');
  getFaceJS();
}

asmWorker.onmessage = function (e) {
  updateCanvas(e, 'canvas-asm');
}

jsWorker.onmessage = function (e) {
  console.log(e);
  updateCanvasJS(e);
}

let inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, Parallel);

function handleFiles(e) {
  let original = document.getElementById('original');
  let canvasWasm = document.getElementById('canvas-wasm');
  let canvasAsm = document.getElementById('canvas-asm');
  let canvasJS = document.getElementById('canvas-js');

  canvasWidth = 600 / 1.5;
  canvasHeight = 400 / 1.5;
  ctxOriginal = original.getContext('2d');
  ctxWasm = canvasWasm.getContext('2d');
  ctxAsm = canvasAsm.getContext('2d');
  ctxJS = canvasJS.getContext('2d');
  let url = URL.createObjectURL(e.target.files[0]);
  img.onload = function () {
    let scaleFactor = Math.min((canvasWidth / img.width), (canvasHeight / img.height));
    // canvasWidth = original.width = canvasWasm.width = canvasAsm.width = canvasJS.width = img.width * scaleFactor;
    // canvasHeight = original.height = canvasWasm.height = canvasAsm.height = canvasJS.height = img.height * scaleFactor;
    canvasWidth = original.width = canvasWasm.width = canvasAsm.width = canvasJS.width = img.width;
    canvasHeight = original.height = canvasWasm.height = canvasAsm.height = canvasJS.height = img.height;
    // ctxOriginal.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
    ctxOriginal.drawImage(img, 0, 0);
    // ctxWasm.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
    ctxWasm.drawImage(img, 0, 0);
    // ctxAsm.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
    ctxAsm.drawImage(img, 0, 0);
    ctxJS.drawImage(img, 0, 0);
    console.log(img)
  }

  img.src = url;
}

let container;
let Control = {
  detectFace: detectFace,
  detectEyes: detectEyes,
  //runAllFuncs: runAllFuncs
};

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  gui = new dat.GUI({ autoPlace: false });
  document.body.appendChild(gui.domElement);
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = "0px";
  gui.domElement.style.right = "5px";

  gui.add(Control, 'detectFace');
  gui.add(Control, 'detectEyes');
  //gui.add(Control, 'runAllFuncs');

};
init();

function getFaceJS(){
  new HAAR.Detector(haarcascade_frontalface_alt, false)
    .image(img, .5)
    .interval(40)
    .selection('auto')
    .complete(function () {
      let i;
      let rect;
      let l = this.objects.length;            
      ctxJS.strokeStyle = "rgba(75,221,17,1)";
      ctxJS.lineWidth = 2;
      for (i = 0; i < l; i++) {
        rect = this.objects[i];
        ctxJS.strokeRect(rect.x, rect.y, rect.width, rect.height);
      }
    })
    .cannyThreshold({ low: 90, high: 200 })
    .detect(1, 1.1, 0.12, 1, true);
}
