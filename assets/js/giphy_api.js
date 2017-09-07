function Obfuscate(s) {
    return eval(atob("YnRvYShzKQ=="));
};

function DeObfuscate(s) {
    return eval(atob("YXRvYihzKQ=="));
};

var GiphyDebug = false;

var GiphyRequest = function() {
    this.key = "MTZmMGRkMjJkZjBmNGM1ODgzNDIxMmQ4NTQ0Y2JlZTg=";
    this.url = "http://api.giphy.com";

    function GiphyLimit(l) {
        delete this.limit;
        this.url = DeObfuscate(this.url);
        this.url += "&limit=" + l;
        this.url = Obfuscate(this.url);
        return this;
    };

    function GiphyOffset(o) {
        delete this.offset;
        this.url = DeObfuscate(this.url);
        this.url += "&offset=" + o;
        this.url = Obfuscate(this.url);
        return this;
    };

    function GiphyGet(callback) {
        var url = DeObfuscate(this.url);
        delete this.url;
        delete this.limit;
        delete this.offset;
        delete this.get;
        var self = this;
        $.get(url, function(response) {
            callback(new GiphyResponse(self.query, response));
        });
    };

    this.search = function(q) {
        delete this.search;
        delete this.byID;
        delete this.trending;

        q = q.split(" ").join("+");
        this.query = q;
        this.url += "/v1/gifs/search";
        this.url += "?api_key=" + DeObfuscate(this.key);
        this.url += "&q=" + q;
        this.url = Obfuscate(this.url);
        delete this.key;

        this.limit = GiphyLimit;
        this.offset = GiphyOffset;
        this.get = GiphyGet;

        return this;
    };

    this.byID = function(id) {
        delete this.search;
        delete this.byID;
        delete this.trending;

        this.url += "/v1/gifs/" + id;
        this.url += "?api_key=" + DeObfuscate(this.key);
        this.url = Obfuscate(this.url);
        delete this.key;

        this.get = GiphyGet;
        this.query = "";

        return this;
    };

    this.trending = function() {
        delete this.search;
        delete this.byID;
        delete this.trending;

        this.url += "/v1/gifs/trending";
        this.url += "?api_key=" + DeObfuscate(this.key);
        this.url = Obfuscate(this.url);
        delete this.key;

        this.limit = GiphyLimit;
        this.offset = GiphyOffset;
        this.get = GiphyGet;
        this.query = "";

        return this;
    };
};

var GiphyResponse = function(query, json) {
    if (GiphyDebug) {
        this.json = json;
    }

    switch (json.meta.status) {
        case 200: break;
        case 400: return new Error("GiphyAPI: Bad Request");
        case 403: return new Error("GiphyAPI: Forbidden");
        case 404: return new Error("GiphyAPI: NotFound");
        case 429: return new Error("GiphyAPI: Too Many Requests");
        default:  return new Error("GiphyResponse: Unhandled Status Code " + json.meta.status);
    }

    if (json.pagination) {
        var nextPageOffset = json.pagination.offset + json.pagination.count;
        if (query.length > 0) {
            this.nextPage = new GiphyRequest().search(query);
        } else {
            this.nextPage = new GiphyRequest().trending();
        }
        this.nextPage.limit(json.pagination.count).offset(nextPageOffset);

        if (json.pagination.offset > json.pagination.count) {
            var prevPageOffset = json.pagination.offset - json.pagination.count;
            if (query.length > 0) {
                this.prevPage = new GiphyRequest().search(query);
            } else {
                this.prevPage = new GiphyRequest().trending();
            }
            this.prevPage.limit(json.pagination.count).offset(prevPageOffset);
        }
    }

    if (json.data instanceof Array) {
        this.images = new Array(json.data.length);
        for (var i = 0; i < json.data.length; i++) {
            this.images[i] = new GiphyImage(json.data[i]);
        }
    } else {
        this.images = [new GiphyImage(json.data)];
    }
};

var GiphyImage = function(json) {
    this.id = json.id;
    this.rating = json.rating;
    this.original = json.images.original;
    this.fixedWidth = json.images.fixed_width;
    this.fixedHeight = json.images.fixed_height;
};
