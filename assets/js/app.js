var App = function(searchOutlet, savedSearchesOutlet, resultsOutlet) {
    var self = this;

    var searchChildren = searchOutlet.children();
    this.searchInput = $(searchChildren[0]);
    this.searchInput.keypress(function(e) {
        if (e.which === 13) {
            self.handleSearch();
        }
    });
    this.searchButton = $($(searchChildren[1]).children()[0]);
    this.searchButton.click(function() {
        self.handleSearch();
    });

    this.savedSearchesOutlet = savedSearchesOutlet;
    this.resultsOutlet = resultsOutlet;

    this.displayImages = function(response) {
        if (response instanceof Error) {
            self.resultsTitle.text(response.message);
            return;
        }

        if (response.prevPage) {
            $("#prevBtn").removeClass("btn-secondary").addClass("btn-primary").click(function() {
                self.resetDisplay();
                response.prevPage.get(self.displayImages);
            });
        }
        if (response.nextPage) {
            $("#nextBtn").removeClass("btn-secondary").addClass("btn-primary").click(function() {
                self.resetDisplay();
                response.nextPage.get(self.displayImages);
            });
        }

        for (var i = 0; i < response.images.length; i++) {
            var img = response.images[i];
            if (img.rating === "pg-13" || img.rating === "r") {
                continue;
            }

            var imgWrapper = $("<div class='m-1 imgResult'>").css({
                "width": img.still.width,
                "height": (Math.floor(img.still.height) + 24)
            })
            .data("saved", img)
            .appendTo(self.resultsOutlet);

            var imgEl = $("<img>").attr({
                "src": img.still.url,
                "width": img.still.width,
                "height": img.still.height
            }).data({
                still: img.still.url,
                moving: img.fixedWidth.url,
                state: "still"
            }).click(function() {
                if ($(this).data("state") === "still") {
                    $(this).data("state", "moving");
                } else {
                    $(this).data("state", "still");
                }
                $(this).attr("src", $(this).data($(this).data("state")));
            })
            .appendTo(imgWrapper);

            var metadata = $("<div class='metadata'>").appendTo(imgWrapper);
            $("<span class='rating'>").text(img.rating.toUpperCase()).appendTo(metadata);
            $("<img class='resize'>").attr({
                src: "assets/img/si-glyph-arrow-resize-5.svg",
                width: 16,
                height: 16,
                "data-toggle": "modal",
                "data-target": "#originalModal"
            }).data("saved", img)
            .click(function() {
                var data = $(this).data("saved");
                $("#originalImage").attr("src", data.original.url);
                $("#originalSlug").text(data.slug);
            })
            .appendTo(metadata);
        }
    };

    this.resetDisplay = function() {
        $(".imgResult").remove();
        $("#prevBtn").prop("onclick", null).off("click");
        $("#nextBtn").prop("onclick", null).off("click");
        $("#prevBtn").removeClass("btn-primary").addClass("btn-secondary");
        $("#nextBtn").removeClass("btn-primary").addClass("btn-secondary");
    }

    this.handleSearch = function() {
        var query = self.searchInput.val();
        self.resetDisplay();
        $("#resultsTitle").text("Results for '" + query + "'");
        var searchRequest = new GiphyRequest().search(query).limit(12)
        self.addSavedSearch(query.trim(), searchRequest);
        searchRequest.get(self.displayImages);
    };

    this.addSavedSearch = function(text, request) {
        var item = $("<a href='#' class='dropdown-item'>").text(text);
        item.data({
            "request": request,
            "text": text
        });
        item.click(function() {
            self.resetDisplay();
            var text = $(this).data("text");
            var titleText = "Results for '" + text + "'";
            if (text === "Trending") { titleText = text; }
            $("#resultsTitle").text(titleText);
            $(this).data("request").get(self.displayImages);
        });
        self.savedSearchesOutlet.append(item);
    }

    $("#resultsTitle").text("Trending");
    var trendingRequest = new GiphyRequest().trending().limit(12);
    self.addSavedSearch("Trending", trendingRequest);
    trendingRequest.get(self.displayImages);

    var itsGifWithASoftG = ["giraffe", "image", "format", "fight", "me", "haters"];
    itsGifWithASoftG.forEach(function(word) {
        self.addSavedSearch(word, new GiphyRequest().search(word).limit(12));
    })
};
