var face_cascade ;
var eye_cascade ;

show_video = function(mat, canvas_id) {
	var data = mat.data(); 	// output is a Uint8Array that aliases directly into the Emscripten heap

	channels = mat.channels();
	channelSize = mat.elemSize1();

	var canvas = document.getElementById(canvas_id);

	ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	canvas.width = mat.cols;
	canvas.height = mat.rows;

	imdata = ctx.createImageData(mat.cols, mat.rows);

	for (var i = 0,j=0; i < data.length; i += channels, j+=4) {
		imdata.data[j] = data[i];
		imdata.data[j + 1] = data[i+1%channels];
		imdata.data[j + 2] = data[i+2%channels];
		imdata.data[j + 3] = 255;
	}
	ctx.putImageData(imdata, 0, 0);
}