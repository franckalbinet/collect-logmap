Vis.Views.Map = Backbone.View.extend({

    map: null,
    features: null,
    g: null,

    scale: null,
    accessor: null,
    chartId: null,
    legendId: null,
    
    events: {
    },

    initialize: function (options) {  
      var that = this;

      this.scale = options.scale;
      this.accessor = options.accessor;

      // keep only geometry with data available
      this.features = this.model.get("data").geometry.features.filter(function(d) { 
        return _.has(that.model.get("data").lookup, d.id); 
      });

      this.joinGeomData(0);

      if(this.map) this.map.remove();

      this.initMap();
      
      
      this.model.on("change:period", function() {
        var period = this.get("period");
        that.joinGeomData(period);
        that.render();
      });
      
    },

    joinGeomData: function(period) {
      var that = this;
      this.features.forEach(function(d) {
        _.extend(d.properties, that.model.get("data").lookup[d.id][period]); 
      });
    },

    initMap: function() {
      var that = this;

      L.mapbox.accessToken = Vis.DEFAULTS.MAP_ACCESS_TOKEN;
      
      //this.chartId = this.$el.find("[id$=-chart]").attr("id");

      this.map = L.mapbox.map(
        this.$el.attr("id"), 
        Vis.DEFAULTS.MAP_BACKGROUND,
        {
          minZoom: 0,
          attributionControl: false,
          zoomControl: false,
          dragging: true,
          touchZoom: false,
          scrollWheelZoom: false
        }
      ).setView(Vis.DEFAULTS.MAP_FOCUS.center, Vis.DEFAULTS.MAP_FOCUS.zoom);

      // To be put in a separate file
      // Initialize the SVG layer 
      this.map._initPathRoot();
      
      // Pick up the SVG form the map object
      var svg = d3.select("#" + this.$el.attr("id")).select("svg");
      this.g = svg.append("g");

      that.render();

      this.map.on("moveend", function() {
        that.model.set("zoomLevel", that.map.getZoom());
        that.render();
      });
    },

    render: function() {
      var that = this;
      // Define the d3 projection 
      var path = d3.geo.path().projection(function project(x) {
          var point = that.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
          return [point.x, point.y];
      });

      // Data join
      var paths = that.g.selectAll("path")
          .data(that.features, function(d) { 
            return d.id + "-" + that.model.get("zoomLevel"); });

      // if new dataset is smaller than the old one  -- remove
      paths.exit().remove();

      // if new dataset is larger
      paths.enter().append("path")
        .attr("d", path)
        .attr("class", "choropleth")
        .style("fill", function(d) { 
          console.log("in enter");
          return that.scale(that.accessor(d)); });

      // if same size
      //paths.attr("d", path)
      paths
        .style("fill", function(d) { 
          return that.scale(that.accessor(d)); });     
    }
  });