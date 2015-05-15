Vis.Models.App = Backbone.Model.extend({

  defaults: {
    data: null,
    timeBtnStatus: "pause", // "pause" or "play"
    period: 0
  },

  initialize: function () {
    this.set("zoomLevel", Vis.DEFAULTS.MAP_FOCUS.zoom);
    this.listenTo(Vis.Collections.app, "loaded", function(data) { this.bundle(data); });
  },


  bundle: function(data) {
    var that = this;

    data["lookup"] = this.buildLookup(data);
    // update model
    this.set("data", data);
  },

  buildLookup: function(data) {
    var lookup = {};
    data.data.forEach(function(d) {
      if(!_.has(lookup, d.name)) {
        var periods = new Array(Vis.DEFAULTS.NB_PERIODS_SIMULATED);
        periods[d.period] = {analysed: d.analysed, collected: d.collected, collectors: d.collectors, labs: d.labs, planned: d.planned};  
        lookup[d.name] = periods; 
      } else {
        lookup[d.name][d.period] = {analysed: d.analysed, collected: d.collected, collectors: d.collectors, labs: d.labs, planned: d.planned};  
      }
    })
    return lookup;
  }
}) 
