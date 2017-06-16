console.log('hola mundo')
const inputElement = document.getElementById("input");
inputElement.addEventListener("change", paintCanvas, false);

let upload = false;
let startDraw;
let videoRunning = false;

const elems = document.body.getElementsByTagName("canvas");
const s = {};

function paintCanvas(e) {

    if (document.getElementById("myCanvas")) {
        document.getElementById("myCanvas").remove();
        document.getElementById("myCanvas2").remove();
        document.getElementById("myCanvas3").remove();
    }

    let myCanvas = document.createElement('canvas');
    let myCanvas2 = document.createElement('canvas');
    let myCanvas3 = document.createElement('canvas');
    myCanvas.id = "myCanvas";
    myCanvas2.id = "myCanvas2";
    myCanvas3.id = "myCanvas3";

    const theDiv = document.getElementById("theDiv");
    theDiv.appendChild(myCanvas);
    theDiv.appendChild(myCanvas2);
    theDiv.appendChild(myCanvas3);

    const canvas = document.getElementById('myCanvas');
    const canvas2 = document.getElementById('myCanvas2');
    const canvas3 = document.getElementById('myCanvas3');
    const ctx = canvas.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const ctx3 = canvas3.getContext('2d');

    if (upload) {
        if (videoRunning) {
            videoRunning = false;
            const vid = document.getElementById('myVideo');
            vid.pause();
            clearTimeout(startDraw);
        }
        clearTimeout(startDraw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        ctx3.clearRect(0, 0, canvas.width, canvas.height);
    }

    upload = true;

    const reducer = 2.5;
    const canvasWidth = (600 * 2) / reducer;
    const canvasHeight = (400 * 2) / reducer;

    const type = e.target.files[0].type;
    if (type.indexOf('image') > -1) {
        console.log(`uploading an img`)
        const url = URL.createObjectURL(e.target.files[0]);
        const img = new Image();
        img.onload = function () {
            const scaleFactor = Math.min((canvasWidth / img.width), (canvasHeight / img.height));
            canvas.width = img.width * scaleFactor;
            canvas2.width = img.width * scaleFactor;
            canvas3.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            canvas2.height = img.height * scaleFactor;
            canvas3.height = img.height * scaleFactor;
            ctx.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
            ctx2.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
            ctx3.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
        }
        img.src = url;
    } else {
        let myVideo = document.createElement('video');
        myVideo.id = "myVideo";
        document.body.appendChild(myVideo);

        console.log(`uploading a video`)
        const file = this.files[0];
        const type = file.type;
        const videoNode = document.querySelector('video');

        const fileURL = URL.createObjectURL(file)
        videoNode.src = fileURL

        const v = document.getElementById('myVideo');
        const canvas = document.getElementById('myCanvas');
        const canvas2 = document.getElementById('myCanvas2');
        const canvas3 = document.getElementById('myCanvas3');

        const context = canvas.getContext('2d');
        const context2 = canvas2.getContext('2d');
        const context3 = canvas3.getContext('2d');

        console.log(`v is ${v}`)
        v.addEventListener("loadedmetadata", function (e) {
            var width = this.videoWidth,
                height = this.videoHeight;

            // const cw = width / 4;
            // const ch = height / 4;
            const cw = 365;
            const ch = 205;

            canvas.width = cw;
            canvas.height = ch;
            canvas2.width = cw;
            canvas2.height = ch;
            canvas3.width = cw;
            canvas3.height = ch;

            v.addEventListener('play', function () {
                draw(this, context, cw, ch);
                draw(this, context2, cw, ch);
                draw(this, context3, cw, ch);
            }, false);

        }, false);

    }

}

function draw(v, c, w, h) {
    videoRunning = true;
    if (v.paused || v.ended) return false;
    c.drawImage(v, 0, 0, w, h);
    startDraw = setTimeout(draw, 20, v, c, w, h);
}


var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement = document.getElementById('spinner');
var Module = {
    preRun: [],
    postRun: [],
    print: (function () {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function (text) {
            text = Array.prototype.slice.call(arguments).join(' ');
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            console.log(text);
            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
        };
    })(),
    printErr: function (text) {
        text = Array.prototype.slice.call(arguments).join(' ');
        if (0) { // XXX disabled for safety typeof dump == 'function') {
            dump(text + '\n'); // fast, straight to the real console
        } else {
            console.error(text);
        }
    },
    canvas: (function () {
        var canvas = document.getElementById('resCanvas');
        return canvas;
    })(),
    setStatus: function (text) {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
        if (m) {
            text = m[1];
            progressElement.value = parseInt(m[2]) * 100;
            progressElement.max = parseInt(m[4]) * 100;
            progressElement.hidden = false;
            spinnerElement.hidden = false;
        } else {
            progressElement.value = null;
            progressElement.max = null;
            progressElement.hidden = true;
            if (!text) spinnerElement.style.display = 'none';
        }
        statusElement.innerHTML = text;
    },
    totalDependencies: 0,
    monitorRunDependencies: function (left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
};
Module.setStatus('Downloading...');
window.onerror = function (event) {
    // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
    Module.setStatus('Exception thrown, see JavaScript console');
    spinnerElement.style.display = 'none';
    Module.setStatus = function (text) {
        if (text) Module.printErr('[post-exception status] ' + text);
    };
};

