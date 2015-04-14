Vis.Views.Map = Backbone.View.extend({

    map: null,
    //hexBinLayer: null,

    dim: null,
    grp: null,
    colorScale: null,
    colorRule: null,
    //renderingMode : "filtering", // re-rendering map either during other dimensions brushing or only when brushing end.
                                 // used here to make possible/fluid navigation over 200000 points of REMDB
                                 // but has no vocation to display such amount of measurements
    chartId: null,
    legendId: null,
    
    events: {
      //"click a.reset": "clearFilter",
      //"click #default-location": "toDefaultView"
    },

    initialize: function () {  
      var that = this;

      /*
      // Hardcoded cases will be replace by additionnal business logic later on based on size of dataset
      this.renderingMode = (this.model.get("data").file == "chernobyl-focus.csv") ?
        "filtering" :
        "filtered";

      */

      if(this.map) {
        this.map.remove();
      }

      this.initMap();

      /*
      this.chartId = "#" + this.$el.find("[id$=-chart]").attr("id");

      this.colorScale = d3.scale.threshold()
        .range(['rgb(224,243,219)','rgb(204,235,197)','rgb(168,221,181)','rgb(123,204,196)','rgb(78,179,211)','rgb(43,140,190)','rgb(8,104,172)','rgb(8,64,129)'])
        .domain([20,100,200,900,1500,10000,100000]);

      this.colorRule = function(d) { return d3.max(d, function(d){ return d.value; }); };

      this.dim = this.model.get("data").dims.idLatLon;
      this.grp = this.model.get("data").grps.idLatLon;

      // creating hexbin layer
      if(this.hexBinLayer) {
        //this.hexBinLayer = null;
        d3.select("svg.leaflet-zoom-animated").remove();
        d3.select(this.legendId).select("svg").remove();
      } 

      this.initHexBinLayer();

      this.map.on("moveend", function () { 
        that.dim.filterAll();
        Backbone.trigger("filtering:map");
        that.render();
      });
*/

      //this.render();
      //this.renderLegend();
      
      /*
      // chart brush event listeners
      this.hexBinLayer.on("filtered", function(brush) { 
        (brush.empty()) ?
          that.$el.find("a.reset").hide():
          that.$el.find("a.reset").show();
        Backbone.trigger("filtered:map");
      });

      this.hexBinLayer.on("filtering", function(brush) { 
        if (brush.empty()) {
           that.dim.filterAll();
        } else {
          that.dim.filterFunction(function(d) { 
            var parsed = d.split("/");
            var lat = +parsed[1];
            var lon = +parsed[2];
            return brush.within([lat, lon], brush.extent());
          }); 
        }
        Backbone.trigger("filtering:map");
      });
      
      // listen to other charts filtered events
      var throtteled = _.throttle(update, 0);

      Backbone.off(null, null, this);
      Backbone.on(this.renderingMode + ":histogram " +  this.renderingMode +  ":barchart filtered:substance filtered:foodstuffs", 
          function(d) { throtteled();}, this);

      Backbone.on("zoomTo", function(d) {
        that.map.setView(d, 17);}, this);

      function update() {
        that.render({redrawBrush: false});
      }
      */
    },

    initMap: function() {
      var that = this;

      L.mapbox.accessToken = Vis.DEFAULTS.MAP_ACCESS_TOKEN;
      
      this.chartId = this.$el.find("[id$=-chart]").attr("id");

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

      /*
      L.control.pan({
        position: 'topleft',
        panOffset: 300
      }).addTo(this.map);
      */
      
      // scale
      //L.control.scale({maxWidth: 150, imperial: false}).addTo(this.map);  
      
      // context map
      /*
      new L.Control.MiniMap(L.mapbox.tileLayer(Vis.DEFAULTS.MAP_BACKGROUND), {
        zoomLevelOffset: -6,
        aimingRectOptions: {color: "#14547d", weight: 1, opacity: 0.5, fillOpacity: 0.2}
      }).addTo(this.map);   
      */
    },

    /*

    render: function(options) {   
      d3.select(this.chartId).call(this.hexBinLayer, options); 
    },

    renderLegend: function() {
      this.legendId = "#" + this.$el.find("#legend-choropleth").attr("id");
      d3.select(this.legendId).call(this.hexBinLegend); 
    },

    initHexBinLayer: function() {
      var that = this;

      this.hexBinLayer = d3.myHexBinLayer()
        .map(this.map)
        .radius(7)
        .group(this.grp)
        .colorScale(this.colorScale)
        .colorRule(this.colorRule);

      this.hexBinLegend = d3.myLegendChoropleth()
        .width(300)
        .height(65)
        .margins({top: 30, right: 50, bottom: 0, left: 20})
        .colorScale(this.colorScale)
        .title("Max concentration level in Bq/Kg");

    },

    toDefaultView: function() {
      this.map.setView(Vis.DEFAULTS.MAP_FOCUS.center, Vis.DEFAULTS.MAP_FOCUS.zoom);
    },

    clearFilter: function(e) {
      e.preventDefault();
      this.hexBinLayer.clearBrush();
    }
    */
    
  });