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

    this.resultsOutlet = resultsOutlet;
    this.resultsTitle = $("<h3>").text("Trending").appendTo(this.resultsOutlet);
    var trending = new GiphyRequest().trending().get(function(response) {
        if (response instanceof Error) {
            self.resultsTitle.text(response.message);
            return;
        }
        for (var i = 0; i < response.images.length; i++) {
            var img = response.images[i];
            $("<img class='m-1'>").attr("src", img.fixedWidth.url)
                                  .data("saved", img)
                                  .appendTo(self.resultsOutlet);
        }
    });

    this.handleSearch = function() {
        var query = self.searchInput.val();
        console.log(query);
    };
};
