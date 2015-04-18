Vis.Models.App = Backbone.Model.extend({

  //logBin: null,

  defaults: {
    data: null,
    timeBtnStatus: "pause" // "pause" or "play"
  },

  //histBounds: null,

  initialize: function () {
    this.listenTo(Vis.Collections.app, "loaded", function(data) { this.bundle(data); });
  },


  bundle: function(data) {
    var that = this;

    // update model
    this.set("data", data);

    /*
    // Hardcoded cases will be replace by additionnal business logic later on based on time extent of dataset
    var timeResolution = (data.file == "chernobyl-focus.csv") ?
      function(d) { return d3.time.day(d.date); } :
      function(d) { return that.every6months(d.date); }; 

    var histReduce = {
      addValue: function(p,v) {
        var bins = _histBins(v["dose"]);
        p.x = bins.lowerBound;
        p.dx = bins.classWidth;
        ++p.y;
        return p;
      },
      removeValue: function(p,v) {
        --p.y;
        return p;
      },
      initValue: function() {
        return {x: 0, dx: 0, y: 0};
      }
    };

    var spatialReduce = {
      addValue: function(p,v) {
        p.data = v["dose"];
        p.lon = v["lon"];
        p.lat = v["lat"];
        return p;
      },
      removeValue: function(p,v) {
        p.data = -1;
        return p;
      },
      initValue: function() {
        return {data: 0, lon: 0, lat: 0};
      }
    };

    // create dimensions and groups
    data["cf"] = crossfilter(data.data);
    data["all"] = data.cf.groupAll();

    // crossfilter dimensions definition
    data["dims"] = {
      time: data.cf.dimension(timeResolution),
      dose: data.cf.dimension(function(d) { return d.dose; }),
      substance: data.cf.dimension(function(d) { return d.substance; }),
      foodstuff: data.cf.dimension(function(d) { return d.type; }),
      idLatLon: data.cf.dimension(function(d) { return d.id + "/" + d.lat + "/" + d.lon; })
    };

    // crossfilter groups definition
    data["grps"] = {
      time: data.dims.time.group().reduceCount(),
      dose: data.dims.dose.group().reduce(histReduce.addValue,histReduce.removeValue, histReduce.initValue),
      substance: data.dims.substance.group().reduceCount(),
      foodstuff: data.dims.foodstuff.group().reduceCount(),
      idLatLon: data.dims.idLatLon.group().reduce(spatialReduce.addValue,spatialReduce.removeValue, spatialReduce.initValue)
    };

    //data.grps.dose.top(Infinity);
    //data.grps.idLatLon.top(Infinity);
    */
   
    /*
    function _histBins(value) {
      if (value <= 1) return {lowerBound: 0.8, classWidth: 0.2};
      var bounds = data.histBins;
      var lowerBoundIdx = d3.bisectRight(bounds.map(function(d) {return d.lowerBound;}), value) - 1;  
      return bounds[lowerBoundIdx];
    }
    */
  }
}) 
