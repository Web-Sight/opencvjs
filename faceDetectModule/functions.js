var face_cascade;
var eye_cascade;


function detectFaceJquery() {
    var t0 = performance.now();
    (function () {
        $('#canvas2').faceDetection({
            complete: function (faces) {
                console.log(faces)
                const c = document.getElementById("canvas2");
                const ctx = c.getContext("2d");

                for (let i = 0; i < faces.length; i++) {
                    ctx.strokeStyle = "blue";
                    ctx.lineWidth = 3.5;
                    ctx.strokeRect(faces[i].x, faces[i].y, faces[i].width, faces[i].height);

                }
            }
        });
    })();
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
};


show_image = function (mat, canvas_id) {
    var data = mat.data(); 	// output is a Uint8Array that aliases directly into the Emscripten heap

    channels = mat.channels();
    channelSize = mat.elemSize1();

    var canvas = document.getElementById(canvas_id);

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = mat.cols;
    canvas.height = mat.rows;

    imdata = ctx.createImageData(mat.cols, mat.rows);

    for (var i = 0, j = 0; i < data.length; i += channels, j += 4) {
        imdata.data[j] = data[i];
        imdata.data[j + 1] = data[i + 1 % channels];
        imdata.data[j + 2] = data[i + 2 % channels];
        imdata.data[j + 3] = 255;
    }
    ctx.putImageData(imdata, 0, 0);
}

var inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles(e) {
    var canvas = document.getElementById('canvas1');
    var canvas2 = document.getElementById('canvas2');
    var canvas3 = document.getElementById('canvas3');
    var canvasWidth = 600/1.5;
    var canvasHeight = 400/1.5;
    var ctx = canvas.getContext('2d');
    var ctx2 = canvas2.getContext('2d');
    var ctx3 = canvas3.getContext('2d');
    var url = URL.createObjectURL(e.target.files[0]);
    var img = new Image();
    img.onload = function () {
        //ctx.drawImage(img, 20, 20);

        var scaleFactor = Math.min((canvasWidth / img.width), (canvasHeight / img.height));
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        canvas2.width = img.width * scaleFactor;
        canvas2.height = img.height * scaleFactor;
        canvas3.width = img.width * scaleFactor;
        canvas3.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
        ctx2.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
        ctx3.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
    }
    img.src = url;
}

function getInput() {
    var canvas = document.getElementById('canvas1');
    var ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imgData;
}

function makeGray() {
    var src = cv.matFromArray(getInput(), 24); // 24 for rgba
    var res = new cv.Mat();
    cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0)
    show_image(res, "canvas1")
    src.delete();
    res.delete();
}

function detectFaceWasm() {

    var t0 = performance.now();
    (function () {
        if (face_cascade == undefined) {
            console.log("Creating the Face cascade classifier");
            face_cascade = new cv.CascadeClassifier();
            face_cascade.load('../../test/data/haarcascade_frontalface_default.xml');
        }

        var img = cv.matFromArray(getInput(), 24); // 24 for rgba


        var img_gray = new cv.Mat();
        var img_color = new cv.Mat(); // Opencv likes RGB
        cv.cvtColor(img, img_gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
        cv.cvtColor(img, img_color, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);


        var faces = new cv.RectVector();
        var s1 = [0, 0];
        var s2 = [0, 0];
        face_cascade.detectMultiScale(img_gray, faces, 1.1, 3, 0, s1, s2);

        for (var i = 0; i < faces.size(); i += 1) {
            var faceRect = faces.get(i);
            x = faceRect.x;
            y = faceRect.y;
            w = faceRect.width;
            h = faceRect.height;
            var p1 = [x, y];
            var p2 = [x + w, y + h];
            var color = new cv.Scalar(255, 0, 0);
            cv.rectangle(img_color, p1, p2, color, 2, 8, 0);
            faceRect.delete();
            color.delete();

        }

        show_image(img_color, "canvas1");

        img.delete();
        img_color.delete();
        faces.delete();
        img_gray.delete();
    })();
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");

}


function detectEyes() {
    if (face_cascade == undefined) {
        console.log("Creating the Face cascade classifier");
        face_cascade = new cv.CascadeClassifier();
        face_cascade.load('../../test/data/haarcascade_frontalface_default.xml');
    }
    if (eye_cascade == undefined) {
        console.log("Creating the eye cascade classifier");
        eye_cascade = new cv.CascadeClassifier();
        eye_cascade.load('../../test/data/haarcascade_eye.xml');
    }

    var img = cv.matFromArray(getInput(), 24); // 24 for rgba
    var img_gray = new cv.Mat();
    var img_color = new cv.Mat();
    cv.cvtColor(img, img_gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
    cv.cvtColor(img, img_color, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

    var faces = new cv.RectVector();
    var s1 = [0, 0];
    var s2 = [0, 0];
    face_cascade.detectMultiScale(img_gray, faces, 1.1, 3, 0, s1, s2);


    for (var i = 0; i < faces.size(); i += 1) {
        var faceRect = faces.get(i);
        x = faceRect.x;
        y = faceRect.y;
        w = faceRect.width;
        h = faceRect.height;
        var p1 = [x, y];
        var p2 = [x + w, y + h];
        var color = new cv.Scalar(255, 0, 0);
        var gcolor = new cv.Scalar(0, 255, 0);
        cv.rectangle(img_color, p1, p2, color, 2, 8, 0);
        var roiRect = new cv.Rect(x, y, w, h);

        var roi_gray = img_gray.getROI_Rect(roiRect);
        var roi_color = img_color.getROI_Rect(roiRect);

        var eyes = new cv.RectVector();
        eye_cascade.detectMultiScale(roi_gray, eyes, 1.1, 3, 0, s1, s2);


        console.log(eyes.size() + " eyes were found.");
        for (var j = 0; j < eyes.size(); j += 1) {

            var eyeRect = eyes.get(j);
            console.log(eyeRect.width + "," + eyeRect.height);

            var p1 = [x + eyeRect.x, y + eyeRect.y];
            var p2 = [x + eyeRect.x + eyeRect.width, y + eyeRect.y + eyeRect.height];

            cv.rectangle(img_color, p1, p2, gcolor, 2, 8, 0);
        }

        eyes.delete();
        faceRect.delete();
        color.delete();
        gcolor.delete();
        roi_gray.delete();
        roi_color.delete();

    }

    show_image(img_color, "canvas1");

    img.delete();
    img_color.delete();
    faces.delete();
    img_gray.delete();

}

function download() {
    var dt = canvas2.toDataURL('image/jpeg');
    this.href = dt;
};
downloadLnk.addEventListener('click', download, false);

var ress = [];

function runTest(fct) {
    var start = performance.now();
    fct()
    var end = performance.now();
    var time = end - start;
    var res = { testName: fct.name, executionTime_ms: time };
    ress.push(res);
    var d = new Date().toString();
    var filename = "file_" + fct.name + "_" + d;
    downloadLnk.setAttribute('download', filename);
    downloadLnk.click();
}

function runAllTests() {
    ress = [];
    runTest(detectFace);
    runTest(detectEyes);
    var d = new Date().toString();
    downloadCSV({ filename: "OpenCV_face_detect_results_" + d + ".csv" });
}

function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
        ctr = 0;
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function downloadCSV(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: ress
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}

function runAllFuncs() {
    detectFaceJquery();
    detectFaceWasm();
        
};

var container;
// var Zee;
var Control = {
    detectFaceWasm: detectFaceWasm,
    detectEyes: detectEyes,
    detectFaceJquery: detectFaceJquery,
    runAllFuncs: runAllFuncs
};



function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    gui = new dat.GUI({ autoPlace: false });
    document.body.appendChild(gui.domElement);
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0px";
    gui.domElement.style.right = "5px";

    gui.add(Control, 'detectFaceWasm');
    gui.add(Control, 'detectFaceJquery');
    gui.add(Control, 'detectEyes');
    gui.add(Control, 'runAllFuncs');

};
init();
