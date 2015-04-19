Vis.Views.Map = Backbone.View.extend({

    map: null,
    features: null,
    g: null,
    selected: [],
    legend: null,
    tooltip: null,

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
      this.legendTitle = options.legendTitle;

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

      Backbone.on("pcBrushing featureIn featureOut", 
        function(selected) { 
          this.selected = selected;
          that.render();
        }
      ,this);
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

      // Legend
      this.legend = d3.myLegendChoropleth()
        .width(130)
        .height(50)
        .margins({top: 10, right: 40, bottom: 0, left: 10})
        .heightClassRect(13)
        .colorScale(this.scale)
        .title("");

      this.renderLegend();

    },

    renderLegend: function() {
      this.legendId = "#" + this.$el.find(".legend").attr("id");
      d3.select(this.legendId).call(this.legend); 
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
          return that.scale(that.accessor(d)); })
        .on("mouseover", function(d) {
          Backbone.trigger("featureIn", [d.id]);
          Vis.DEFAULTS.D3_TOOLTIP.html(d.id).style("visibility", "visible");
        })
        .on("mouseout", function(d) {
          Backbone.trigger("featureOut", []);
          Vis.DEFAULTS.D3_TOOLTIP.html(d.id).style("visibility", "hidden");
        })
        .on("mousemove", function(d) {
          Vis.DEFAULTS.D3_TOOLTIP.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })

      // if same size
      //paths.attr("d", path)
      paths
        .style("fill", function(d) { 
          return that.scale(that.accessor(d)); })
        .style("fill-opacity", function(d) {
          var opacity = 0.7;
          if (that.selected.length != 0) {
            opacity = (_.contains(that.selected, d.id)) ? 0.7 : 0;
          }
          return opacity;
        });
    }
  });