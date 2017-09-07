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
    this.savedSearches = new Array();

    this.displayImages = function(size) {
        return function(response) {
            if (response instanceof Error) {
                self.resultsTitle.text(response.message);
                return;
            }
            for (var i = 0; i < response.images.length; i++) {
                var img = response.images[i];
                var imgEl = $("<img class='m-1 imgResult'>")
                            .attr({
                                "src": img[size].url,
                                "data-toggle": "modal",
                                "data-target": "#originalModal"
                            })
                            .data("saved", img)
                            .appendTo(self.resultsOutlet);
                imgEl.click(function() {
                    var originalURL = $(this).data("saved").original.url;
                    $("#originalImage").attr("src", originalURL);
                })
            }
        }
    };

    this.handleSearch = function() {
        var query = self.searchInput.val();
        self.resultsTitle.text("Results for '" + query + "'");
        $(".imgResult").remove();
        new GiphyRequest().search(query).get(self.displayImages("fixedWidth"));
    };

    this.resultsOutlet = resultsOutlet;
    this.resultsTitle = $("<h3>").text("Trending").appendTo(this.resultsOutlet);
    new GiphyRequest().trending().get(self.displayImages("fixedWidth"));
};
