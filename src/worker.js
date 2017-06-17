var face_cascade;

function faceDetect(imageData) {
  if (face_cascade == undefined ){
				console.log("Creating the Face cascade classifier");
				face_cascade = new cv.CascadeClassifier();
				let load = face_cascade.load('../../test/data/haarcascade_frontalface_default.xml');
				console.log('load training data', load);
			}

			let img = cv.matFromArray(imageData, 24); // 24 for rgba

			let img_gray = new cv.Mat();
			let img_color = new cv.Mat(); // Opencv likes RGB
			cv.cvtColor(img, img_gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
			cv.cvtColor(img, img_color, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

			let faces = new cv.RectVector();
			let s1 = [0, 0];
			let s2 = [0, 0];
			face_cascade.detectMultiScale(img_gray, faces, 1.1, 3, 0, s1, s2);

			for (let i = 0; i < faces.size(); i += 1)
			{
				let faceRect = faces.get(i);
				x = faceRect.x ;
				y = faceRect.y ;
				w = faceRect.width ;
				h = faceRect.height;
				let p1 = [x, y];
				let p2 = [x+w, y+h];
				let color = new cv.Scalar(255,0,0);
				cv.rectangle(img_color, p1, p2, color, 2, 8, 0);
				faceRect.delete();
				color.delete();
			}

      let message = {
        width: img_color.cols,
        height: img_color.rows,
        data: img_color.data(),
        channels: img_color.channels(),
        channelSize: img_color.elemSize1()
      };

      postMessage(message);

			img.delete();		
      img_color.delete();
			faces.delete();
			img_gray.delete();
}

// TO DO
function eyesDetect(imageData) {

}

self.onmessage = function (e) {
  if (e.data.cmd === 'faceDetect') {
    faceDetect(e.data.img);
  }
	else if (e.data.cmd === 'eyesDetect') {
		eyesDetect(e.data.img);
	}
}

self.onerror = function(e) {
  console.log(e);
}