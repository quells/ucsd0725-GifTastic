function GetTitleBitmap(w, h, fontSize, title, threshold) {
    var canvas = $("<canvas>").attr({width: w, height: h})[0];
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = fontSize + "px Arial Black";
    ctx.fillText(title, w/2, Math.floor(h/2 + fontSize*2/5));

    var imgData = ctx.getImageData(0, 0, w, h);
    for (var i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i+3] > threshold) {
            imgData.data[i] = 255;
            imgData.data[i+1] = 255;
            imgData.data[i+2] = 255;
            imgData.data[i+3] = 255;
        } else {
            imgData.data[i] = 255;
            imgData.data[i+1] = 255;
            imgData.data[i+2] = 255;
            imgData.data[i+3] = 0;
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
};

function UpscaleCanvas(canvasIn, scale) {
    var ctxIn = canvasIn.getContext("2d");

    var src = ctxIn.getImageData(0, 0, canvasIn.width, canvasIn.height);
    var dest = {width: canvasIn.width*scale, height: canvasIn.height*scale};
    dest.data = new Array(dest.width * dest.height * 4);

    var idx1, idx2, x, y, oy;
    for (var j = 0; j < canvasIn.height; j++) {
        oy = j*canvasIn.width;
        y = scale*j;
        for (var i = 0; i < canvasIn.width; i++) {
            idx1 = (i + oy) * 4;
            x = scale*i;
            for (var dy = 0; dy < scale; dy++) {
                for (var dx = 0; dx < scale; dx++) {
                    idx2 = (x+dx + (y+dy)*canvasIn.width*scale) * 4;
                    dest.data[idx2]   = src.data[idx1];
                    dest.data[idx2+1] = src.data[idx1+1];
                    dest.data[idx2+2] = src.data[idx1+2];
                    dest.data[idx2+3] = src.data[idx1+3];
                }
            }
        }
    }

    var canvasOut = $("<canvas>").attr({width: dest.width, height: dest.height})[0];
    var ctxOut = canvasOut.getContext("2d");

    ctxOut.drawImage(canvasIn, 0, 0);
    var src2 = ctxOut.getImageData(0, 0, dest.width, dest.height);
    var idx;
    for (var j = 0; j < dest.height; j++) {
        for (var i = 0; i < dest.width; i++) {
            idx = (i + j*dest.width) * 4;
            src2.data[idx] = dest.data[idx];
            src2.data[idx+1] = dest.data[idx+1];
            src2.data[idx+2] = dest.data[idx+2];
            src2.data[idx+3] = dest.data[idx+3];
        }
    }
    ctxOut.putImageData(src2, 0, 0);

    return canvasOut;
};
