Vis.Views.Map = Backbone.View.extend({

    map: null,
    features: null,
    g: null,
    selected: [],
    legend: null,
    tooltip: null,

    scale: null,
    accessor: null,
    legendId: null,
    
    events: {
    },

    initialize: function (options) {  
      var that = this;

      this.scale = options.scale;
      this.accessor = options.accessor;
      this.legendTitle = options.legendTitle;

      // keep only features with data available
      this.features = this.model.get("data").geometry.features.filter(function(d) { 
        return _.has(that.model.get("data").lookup, d.id); 
      });

      this.joinGeomData(0);

      if(this.map) this.map.remove();

      this.initMap();
            
      this.model.on("change:period", function() {
        var period = this.get("period");
        that.joinGeomData(period);

        //that.choropleth.data(that.features);

        that.render();
      });

      // trigger event on feature hovering to sync other charts
      this.choropleth.on("hovered", 
        function(featureId) {        
          Backbone.trigger("hovered:choropleth", {name: featureId});
        }
      );

      Backbone.on("hovered:scatterplot hovered:parallelCoordinates hovered:choropleth", 
        function(d) {
          this.choropleth.highlight(d.name);
          this.render();
        }
      ,this);

       Backbone.on("moved:map", 
        function(d) {
          this.map.setView(d.center, d.zoom);
        }
      ,this);
    },

    joinGeomData: function(period) {
      var that = this;
      // "feed" features properties with data for specific period
      this.features.forEach(function(d) {
        _.extend(d.properties, that.model.get("data").lookup[d.id][period]); 
        _.extend(d.properties, {period: period}); 
      });
    },

    initMap: function() {
      var that = this;

      L.mapbox.accessToken = Vis.DEFAULTS.MAP_ACCESS_TOKEN;
      
      this.map = L.mapbox.map(
        this.$el.attr("id"), 
        Vis.DEFAULTS.MAP_BACKGROUND,
        {
          minZoom: 0,
          attributionControl: false,
          zoomControl: true,
          dragging: true,
          touchZoom: false,
          scrollWheelZoom: false
        }
      ).setView(Vis.DEFAULTS.MAP_FOCUS.center, Vis.DEFAULTS.MAP_FOCUS.zoom);

      // init choropleth layer
      this.choropleth = d3.myChoroplethLayer()
        .map(this.map)
        .data(this.features)
        .scale(this.scale)
        .accessor(this.accessor);

      this.render();

      this.map.on("moveend", function() {
        that.render();
      });

      this.map.on("drag zoomend", function() {
        Backbone.trigger("moved:map", {zoom: that.map.getZoom(), center: that.map.getCenter()})
      });
     
      // Legend
      this.legend = d3.myChoroplethLegend()
        .width(130)
        .height(38) 
        .margins({top: 10, right: 15, bottom: 0, left: 10})
        .ticks([0, 0.25, 0.5, 0.75, 1])
        .tickFormat(d3.format("%"))
        .scale(d3.scale.ordinal())
        .colors(this.scale.range())
        .heightClassRect(12);

      this.renderLegend();
    },

    renderLegend: function() {
      this.legendId = "#" + this.$el.find(".legend").attr("id");
      d3.select(this.legendId).call(this.legend); 
    },

    render: function() {
      d3.select("#" + this.$el.attr("id")).call(this.choropleth); 
    }
  });