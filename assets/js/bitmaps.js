function GetTitleBitmap(w, h, fontSize, fgcolor, bgcolor, title, threshold) {
    var canvas = $("<canvas>").attr({width: w, height: h})[0];
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = fontSize + "px Roboto";
    ctx.fillText(title, w/2, Math.floor(h/2 + fontSize*2/5));

    var imgData = ctx.getImageData(0, 0, w, h);
    var outData = ctx.getImageData(0, 0, w, h);
    for (var i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i+3] > threshold) {
            outData.data[i] = fgcolor;
            outData.data[i+1] = fgcolor;
            outData.data[i+2] = fgcolor;
            outData.data[i+3] = 255;
        } else {
            if (imgData.data[i-1-4*w] > threshold) {
                outData.data[i] = bgcolor;
                outData.data[i+1] = bgcolor;
                outData.data[i+2] = bgcolor;
                outData.data[i+3] = 255;
            } else {
                outData.data[i+3] = 0;
            }
        }
    }
    ctx.putImageData(outData, 0, 0);
    return canvas;
};

function UpscaleCanvas(canvasIn, scale) {
    var ctxIn = canvasIn.getContext("2d");

    var canvasOut = $("<canvas>").attr({width: canvasIn.width*scale, height: canvasIn.height*scale})[0];
    var ctxOut = canvasOut.getContext("2d");
    ctxOut.drawImage(canvasIn, 0, 0, canvasOut.width, canvasOut.height);

    var src = ctxIn.getImageData(0, 0, canvasIn.width, canvasIn.height);
    var dest = ctxOut.getImageData(0, 0, canvasOut.width, canvasOut.height);

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

    ctxOut.putImageData(dest, 0, 0);
    return canvasOut;
};
