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

    this.displayImages = function(size) {
        return function(response) {
            if (response instanceof Error) {
                self.resultsTitle.text(response.message);
                return;
            }

            if (response.prevPage) {
                $("#prevBtn").removeClass("btn-secondary").addClass("btn-primary").click(function() {
                    self.resetDisplay();
                    response.prevPage.get(self.displayImages("fixedWidth"));
                });
            }
            if (response.nextPage) {
                $("#nextBtn").removeClass("btn-secondary").addClass("btn-primary").click(function() {
                    self.resetDisplay();
                    response.nextPage.get(self.displayImages("fixedWidth"));
                });
            }

            for (var i = 0; i < response.images.length; i++) {
                var img = response.images[i];

                var imgWrapper = $("<div class='m-1 imgResult'>").css({
                    "width": img[size].width,
                    "height": img[size].height
                })
                .attr({
                    "data-toggle": "modal",
                    "data-target": "#originalModal"
                })
                .data("saved", img)
                .appendTo(self.resultsOutlet);

                imgWrapper.click(function() {
                    var data = $(this).data("saved");
                    $("#originalImage").attr("src", data.original.url);
                    $("#originalSlug").text(data.slug);
                });

                var imgEl = $("<img>").attr({
                    "src": img[size].url,
                    "width": img[size].width,
                    "height": img[size].height
                })
                .appendTo(imgWrapper);

                $("<span class='rating'>").addClass(img.rating)
                                          .text("Rated " + img.rating.toUpperCase())
                                          .appendTo(imgWrapper);
            }
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
        var searchRequest = new GiphyRequest().search(query).limit(18)
        self.addSavedSearch(query.trim(), searchRequest);
        searchRequest.get(self.displayImages("fixedWidth"));
    };

    this.addSavedSearch = function(text, request) {
        var item = $("<a href='#' class='dropdown-item'>").text(text);
        item.data("request", request);
        item.click(function() {
            self.resetDisplay();
            $(this).data("request").get(self.displayImages("fixedWidth"));
        });
        self.savedSearchesOutlet.append(item);
    }

    $("#resultsTitle").text("Trending");
    var trendingRequest = new GiphyRequest().trending().limit(18);
    self.addSavedSearch("Trending", trendingRequest);
    trendingRequest.get(self.displayImages("fixedWidth"));
};
