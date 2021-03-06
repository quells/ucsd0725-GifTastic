function Shuffle(arr) {
    // Fisher-Yates (Knuth) Algorithm
    var shuffled = arr.slice(0); // Copy by value
    for (var i = arr.length-1; i > 0; i--) {
        // 1 <= i <= n-1
        var j = Math.floor(Math.random()*(i+1)); // 0 <= j <= i
        // Swap i and j, copying by value
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

var Perlin = function() {
    // Adapted from work done by Ken Perlin
    // http://mrl.nyu.edu/~perlin/noise/

    this.reseed = function() {
        var p = new Array(256);
        for (var i = 0; i < 256; i++) { p[i] = i; }
        p = Shuffle(p);
        this.p = p.concat(p);
    }
    this.reseed();

    this.lerp = function(a, b, t) { return a + t*(b - a); };

    // 2002 version
    this.fade = function(t) { return t*t*t * (t * (6*t - 15) + 10); };
    // Original version
    // this.fade = function(t) { return 3*t*t - 2*t*t*t; };

    this.grad = function(hash, x, y, z) {
        var h = hash & 15;
        var u = (h < 8) ? x : y;
        var v = (h < 4) ? y : (h === 12 || h === 14) ? x : z;
        return (((h&1) === 0) ? u : -u) + (((h&2) === 0) ? v : -v);
    }

    this.noise = function(x, y, z) {
        var X = Math.floor(x) & 255; var Y = Math.floor(y) & 255; var Z = Math.floor(z) & 255;
        x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
        var u = this.fade(x); var v = this.fade(y); var w = this.fade(z);
        var p = this.p; var g = this.grad; var l = this.lerp;
        var A = p[X  ]+Y; var AA = p[A]+Z; var AB = p[A+1]+Z;
        var B = p[X+1]+Y; var BA = p[B]+Z; var BB = p[B+1]+Z;
        var a1 = g(p[AA  ], x  , y  , z  );
        var a2 = g(p[BA  ], x-1, y  , z  );
        var b1 = g(p[AB  ], x  , y-1, z  );
        var b2 = g(p[BB  ], x-1, y-1, z  );
        var c1 = g(p[AA+1], x  , y  , z-1);
        var c2 = g(p[BA+1], x-1, y  , z-1);
        var d1 = g(p[AB+1], x  , y-1, z-1);
        var d2 = g(p[BB+1], x-1, y-1, z-1);
        var a = l(a1, a2, u); var b = l(b1, b2, u);
        var c = l(c1, c2, u); var d = l(d1, d2, u);
        var m = l(a, b, v);   var n = l(c, d, v);
        return l(m, n, w);
    }

    this.noiseByte = function(x, y, z) {
        return Math.floor((256*this.noise(x, y, z) + 128));
    }

    this.image = function(w, h, scale, offset) {
        var canvas = $("<canvas>").attr({width: w, height: h})[0];
        var ctx = canvas.getContext("2d");
        var imgData = ctx.getImageData(0, 0, w, h);
        var s = 1/scale;
        var x, y, c, idx;
        for (var j = 0; j < h; j++) {
            y = j*s;
            for (var i = 0; i < w; i++) {
                x = i*s;
                c = this.noiseByte(x, y, offset);
                idx = (i + j*w) * 4;
                imgData.data[idx]   = c;
                imgData.data[idx+1] = c;
                imgData.data[idx+2] = c;
                imgData.data[idx+3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    this.colorImage = function(w, h, scale, offset) {
        var canvas = $("<canvas>").attr({width: w, height: h})[0];
        var ctx = canvas.getContext("2d");
        var imgData = ctx.getImageData(0, 0, w, h);
        var s = 1/scale;
        var x, y, c, ci, idx;
        var cs = [
            [0xfd, 0x4d, 0x53],
            [0xfe, 0xf3, 0x4b],
            [0x22, 0xff, 0x87],
            [0x18, 0xc1, 0xff],
            [0x85, 0x00, 0xfe]
        ]
        for (var j = 0; j < h; j++) {
            y = j*s;
            for (var i = 0; i < w; i++) {
                x = i*s;
                c = this.noiseByte(x, y, offset);
                if (c > 224) { ci = cs[0]; }
                else if (c > 160) { ci = cs[1]; }
                else if (c > 96) { ci = cs[2]; }
                else if (c > 32) { ci = cs[3]; }
                else { ci = cs[4]; }
                idx = (i + j*w) * 4;
                imgData.data[idx]   = ci[0];
                imgData.data[idx+1] = ci[1];
                imgData.data[idx+2] = ci[2];
                imgData.data[idx+3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }
}
