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
      // load substance type look up table from csv
      /*
      .defer(
        function(url, callback) { 
          d3.csv(url, function(error, result) { 
            callback(error, result); 
          })
            //convert and coerce csv to json on the fly
            .row(function(d) { 
              return {
                id: +d.id,
                name: d.name,
              }
          })   
      },
      that.url + Vis.DEFAULTS.RDN)
      // load foofstuff type look up table from semi colon (foodstuff names already use ,)
      .defer(
        function(url, callback) { 
          that.dsv(url, function(error, result) { 
            callback(error, result); 
          })
            //convert and coerce csv to json on the fly
            .row(function(d) { 
              return {
                id: +d.id,
                name: d.name.toLowerCase(),
              }
          })   
      },
      that.url + Vis.DEFAULTS.FOODSTUFF)
      */  
      // synchronize
      .await(_ready);

    // on success
    function _ready(error, nameCentroid) {
      /*
      var distances = name_centroid.map(function(d) { 
        var from = Vis.DEFAULTS.COORDINATES_INCIDENT;
        var to = [d.lat, d.lon];
        return that.getDistance(from, to);
      });
      */
      var planned = that.getPlanned(nameCentroid);
      var collected = that.getCollected(planned);
      
      /*
      // Convert JSON structure to array with array index = id and array value = name
      // to be further used as lookup tables
      var rdnArray = new Array();
      var foodstuffArray = new Array();
      rdn.forEach(function(d) { rdnArray[d.id] = d.name; });
      foodstuff.forEach(function(d) { foodstuffArray[d.id] = d.name; });
      */

      that.trigger("loaded", {
        "nameCentroid": nameCentroid
      });
    }
  },
  simulateDataset: function(name_centroid) {
  },

  getPlanned: function(name_centroid) {
    var that = this;

    var nameDistances = name_centroid.map(function(d) { 
        var from = Vis.DEFAULTS.COORDINATES_INCIDENT;
        var to = [d.lat, d.lon];
        return {name: d.name, distance: that.getDistance(from, to)};
      });

    var maxDistance = d3.max(nameDistances, function(d) { return d.distance});
    var extentDistance = d3.extent(nameDistances, function(d) { return d.distance});
    
    var scale = d3.scale.pow().exponent(0.1).range([Vis.DEFAULTS.MAX_PLANNED, Vis.DEFAULTS.MAX_PLANNED/50]).domain(extentDistance)

    var planned = nameDistances.map(function(d) {
      var planned = scale(d.distance);
      return {name: d.name, planned: parseInt(planned/100)*100};
    });
    return planned;
  },

  getCollected: function(planned){
    var that = this;

    var collected = [];
    Vis.DEFAULTS.NB_PERIODS_SIMULATED.forEach(function(period) {
      planned.forEach(function(area) {
        var growthRateIndex = parseInt(that.random(0, Vis.DEFAULTS.GROWTH_RATES_SIMULATED.length));
        if (period == 0) {
          collected.push({
            name: area.name,
            planned: area.planned,
            period: period,
            collected: parseInt(area.planned*that.random(0.1,0.2))
          });
        } else {
          var n_1 = collected.filter(function(d) { 
            return d.name == "Fukushima" && d.period == (period - 1) })[0].collected;

          collected.push({
            name: area.name,
            planned: area.planned,
            period: period,
            //collected: parseInt(n_1 + that.random(n_1, area.planned - n_1))
            collected: parseInt(n_1 + Vis.DEFAULTS.GROWTH_RATES_SIMULATED[growthRateIndex](period)*that.random(0, area.planned - n_1))
          });
        } 
      })
    })
    return collected; 
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