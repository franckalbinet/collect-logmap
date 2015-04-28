Vis.Collections.App = Backbone.Collection.extend({
  
  url: "data/",
 
  initialize: function(options) {
    Backbone.off("loadData");
    Backbone.on("loadData", function() { this.loadData() }, this);
  },

  loadData: function(file) {
    // save reference to 'this' refers to other objects in callback functions or sub functions
    // in that way when we want to refer to the collection in callback we can use 'that'
    var that = this;
    
    var id = 0;

    // load synchronously all files
    queue() 
      // load data from csv
      .defer(
        function(url, callback) { 
          d3.csv(url, function(error, result) { 
            callback(error, result); 
          })
            //convert and coerce csv to json on the fly
            .row(function(d) { 
              return {
                name: d.name,
                lat: +JSON.parse(d.centroid)[1],
                lon: +JSON.parse(d.centroid)[0],
              }
            })   
        },
        that.url + Vis.DEFAULTS.PREF_NAME_CENTROID)
      // load admin boundaries json (topojson) file
      .defer(
        function(url, callback) { 
          d3.json(url, function(error, result) { 
            callback(error, result); 
          })   
        },
        that.url + Vis.DEFAULTS.PREF_GEOJSON)
      // synchronize
      .await(_ready);

    // on success
    function _ready(error, withNameCentroid, prefectures) {
      var withPlanned = that.getPlanned(withNameCentroid);
      var withLabs = that.getLabs(withPlanned);
      var withCollectors = that.getCollectors(withLabs);
      var withCollected = that.getCollected(withCollectors);
      var withAnalysed = that.getAnalysed(withCollected);

      topojson.feature(prefectures, prefectures.objects.jpn_adm1_name_only)

      that.trigger("loaded", {
        "data": withAnalysed,
        "geometry": topojson.feature(prefectures, prefectures.objects.jpn_adm1_name_only)
      });
    }
  },

  /*
  getSimulatedData: function(data) {
    return 
      that.getAnalysed(
        that.getCollected(
          that.getPlanned(
            that.getCollectors(
              that.getLabs(data)
            )
          )
        )
      );
  },
  */

  getLabs: function(data){
    var labs = [];

    var scale = d3.scale.pow().exponent(0.1)
      .domain([Vis.DEFAULTS.MIN_LABS, Vis.DEFAULTS.MAX_LABS])
      .range([Vis.DEFAULTS.MIN_PLANNED, Vis.DEFAULTS.MAX_PLANNED]);

    data.forEach(function(item) {
      item["labs"] = parseInt(scale.invert(item.planned));
      labs.push(item);
    });
    return labs;
  },

  getCollectors: function(data){
    var collectors = [];

    var scale = d3.scale.pow().exponent(0.1)
      .domain([Vis.DEFAULTS.MIN_COLLECTORS, Vis.DEFAULTS.MAX_COLLECTORS])
      .range([Vis.DEFAULTS.MIN_PLANNED, Vis.DEFAULTS.MAX_PLANNED]);

    data.forEach(function(item) {
      item["collectors"] = parseInt(scale.invert(item.planned));
      collectors.push(item);
    });
    return collectors;
  },

  // planned items interpolated from min to max based on centroids distance
  getPlanned: function(data) {
    var that = this;

    var nameDistances = data.map(function(item) { 
        var from = Vis.DEFAULTS.COORDINATES_INCIDENT;
        var to = [item.lat, item.lon];
        item["distance"] = that.getDistance(from, to);
        return item;
      });

    var maxDistance = d3.max(nameDistances, function(d) { return d.distance});
    var extentDistance = d3.extent(nameDistances, function(d) { return d.distance});   
    var scale = d3.scale.pow().exponent(0.1)
      .range([Vis.DEFAULTS.MAX_PLANNED, Vis.DEFAULTS.MIN_PLANNED])
      .domain(extentDistance);

    var planned = nameDistances.map(function(item) {
      item["planned"] = parseInt(scale(item.distance)/100) * 100;
      return _.omit(item, ["distance", "lat", "lon"]);
      //return item;
    });

    return planned;
  },

  getCollected: function(data){
    var that = this;

    var collected = [];
    Vis.DEFAULTS.NB_PERIODS_SIMULATED.forEach(function(period) {
      data.forEach(function(item) {
        var growthRateIndex = parseInt(that.random(0, Vis.DEFAULTS.GROWTH_RATES_SIMULATED.length));
        if (period == 0) {
          collected.push(
            _.extend({
              collected: parseInt(item.planned*that.random(0.1,0.2)),
              period: period
            }, item)
          );
        } else {
          var n_1 = collected.filter(function(d) { 
            return d.name == item.name && d.period == (period - 1) })[0].collected;
          collected.push(
            _.extend({
              collected: parseInt(n_1 + Vis.DEFAULTS.GROWTH_RATES_SIMULATED[growthRateIndex](period) * that.random(0, item.planned - n_1)),
              period: period
            }, item)
          );
        } 
      })
    })
    return collected; 
  },

  getAnalysed: function(data) {
    var that = this;

    var analysed = [];

    data.forEach(function(item) {
      var growthRateIndex = parseInt(that.random(0, Vis.DEFAULTS.GROWTH_RATES_SIMULATED.length));
      if(item.period == 0) {

        analysed.push(
          _.extend({analysed: parseInt(item.collected*that.random(0.1,0.2))}, item)
        );

      } else {        
        var n_1 = analysed.filter(function(d) { 
            return d.name == item.name && d.period == (item.period - 1) })[0].analysed;

        analysed.push(
          _.extend(
            {analysed: parseInt(n_1 + Vis.DEFAULTS.GROWTH_RATES_SIMULATED[growthRateIndex](item.period) * that.random(0, item.collected - n_1))}
            , item)
        );
      }
    });
    return analysed;
  },

  random: function(min, max) {
    return Math.random() * (max - min) + min;
  },

  getDistance: function(from, to) { // in [lat, lon]
    // antimeridian and equator cases to be covered 
    // turf.js might be used instead OR covered server side via PostGIS
    var deltaLat = Math.abs(from[0]) - Math.abs(to[0]);
    var deltaLon = Math.abs(from[1]) - Math.abs(to[1]);
    return Math.sqrt(Math.pow(deltaLat, 2) + Math.pow(deltaLon, 2));
  },

});