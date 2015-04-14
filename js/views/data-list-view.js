Vis.Views.DataList = Backbone.View.extend({

  	el: '#data-list-view',

    format: null, 

    sortingBy: function(a,b) { return b.dose - a.dose; },

    paginationIdx: 0,
    itemsPerPage: 15,

    itemTemplate: _.template($(".data-list-items").html(), {variable: 'data'}),

    events: {
      "click a#previous": "previous",
      "click a#next": "next",
      "click tr.measurement": "zoomToMeasurement",
      "click th.orderable": "order"
    },

    initialize: function () {  
      var that = this;

      this.format = function (value, precision) {
        if (isNaN(value)) return "";
        if (value instanceof Date) return d3.time.format("%e %b %Y")(value);

        var formatted = null;
        var prefix = d3.formatPrefix(value);
        formatted = (Number.isInteger(prefix.scale(value))) ?
          prefix.scale(value) + prefix.symbol :
          prefix.scale(value).toFixed(precision) + prefix.symbol;
        return formatted;
      }

      this.render();    
      
      // listen to other charts filtered events
      Backbone.off(null, null, this);
      Backbone.on("filtered:barchart filtered:map filtered:histogram filtering:substance filtered:foodstuffs", 
        function(d) {
          that.paginationIdx = 0;
          that.render();
        }, this);
    },

    render: function() {
      var values = this.getData(this.paginationIdx * this.itemsPerPage, this.itemsPerPage * (this.paginationIdx + 1) - 1);
      this.$el.find("tbody").empty();
      this.$el.find("tbody").html(this.itemTemplate(values));
      this.updatePagination();
    },

    getData: function(from, to) {
      var that = this;
      var ordered = this.model.get("data").dims.dose.top(Infinity).sort(that.sortingBy)

      //var sliced = this.model.get("data").dims.dose.top(Infinity).slice(from, to);
      var sliced = ordered.slice(from, to);

      return sliced.map(function(d) {
        return {
          type: that.model.get("data").foodstuff[d.type],
          substance: that.model.get("data").rdn[d.substance],
          date: that.format(d.date),
          dose: that.format(d.dose),
          lat: d.lat,
          lon: d.lon
        }
      });
    },

    updatePagination: function() {
      var length = this.model.get("data").dims.dose.top(Infinity).length;
     
      (this.paginationIdx > 0) ?
        this.$el.find("#previous").css("visibility", "visible"):
        this.$el.find("#previous").css("visibility", "hidden");

      (length > (this.itemsPerPage * (this.paginationIdx + 1) - 1))?
        this.$el.find("#next").css("visibility", "visible"):
        this.$el.find("#next").css("visibility", "hidden");
    },

    previous: function(e) {
      e.preventDefault()
      this.paginationIdx--;
      this.render();
    },

    next: function(e) {
      e.preventDefault();
      this.paginationIdx++;
      this.render();
    },

    zoomToMeasurement: function(e) {
      Backbone.trigger("zoomTo", {
        lat: +$(e.currentTarget).find(".lat").text(),
        lon: +$(e.currentTarget).find(".lon").text()
      });
    },

    order: function(e) {
      var orderBy = $(e.currentTarget).attr("id");
      this.sortingBy = ($(e.currentTarget).attr("id") == "date") ?
        function(a,b) { return a.date - b.date; }:
        function(a,b) { return b.dose - a.dose; };
      this.render();

    }
  });