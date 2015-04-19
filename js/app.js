window.Vis = {
  DEFAULTS: {},
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  // Initialize method is called from the index.html to bootstrap the Backbone dashboard application
  initialize: function() {
    // DEFAULTS
    Vis.DEFAULTS.MAP_ACCESS_TOKEN = "pk.eyJ1IjoiZnJhbmNrYWxiaW5ldCIsImEiOiI1V19fTV9zIn0.g1ifyyFfA3ibwq33OpArEg";
    Vis.DEFAULTS.MAP_BACKGROUND = "franckalbinet.b1c57a1c";
    //Vis.DEFAULTS.MAP_MINIMAP = "franckalbinet.h6km6hi5";
    //Vis.DEFAULTS.DATA = "chernobyl_focus.csv";
    //Vis.DEFAULTS.RDN = "rdn.csv";
    //Vis.DEFAULTS.FOODSTUFF = "foodstuff.csv";

    Vis.DEFAULTS.PREF_NAME_CENTROID = "pref_name_centroid.csv";
    //Vis.DEFAULTS.PREF_GEOJSON = "jpn_adm1_topojson_0_4.json";
    Vis.DEFAULTS.PREF_GEOJSON = "jpn_adm1_name_topojson.json";
    Vis.DEFAULTS.COORDINATES_INCIDENT = [37.41898, 141.023511];
    Vis.DEFAULTS.MAX_PLANNED = 10000; // for demo/simulated dataset -- will be remove in real situation
    Vis.DEFAULTS.MAX_LABS = 50; 
    Vis.DEFAULTS.MAX_COLLECTORS = 300; 
    Vis.DEFAULTS.NB_PERIODS_SIMULATED = d3.range(0,20); // for demo/simulated dataset -- will be remove in real situation
    Vis.DEFAULTS.PERDOD_SPEED = 200;
    Vis.DEFAULTS.GROWTH_RATES_SIMULATED = [
      d3.scale.linear().domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1]),
      d3.scale.pow().exponent(0.1).domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1]),
      d3.scale.pow().exponent(0.2).domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1]),
      d3.scale.pow().exponent(0.5).domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1]),
      d3.scale.pow().exponent(2).domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1]),
      d3.scale.pow().exponent(3).domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1]),
      d3.scale.pow().exponent(4).domain(d3.extent(Vis.DEFAULTS.NB_PERIODS_SIMULATED)).range([0.1, 1])
    ];
    Vis.DEFAULTS.MAP_FOCUS = {center: [38, 135], zoom: 5};
    Vis.DEFAULTS.D3_TOOLTIP = d3.select("body")
        .append("div")
        .attr("class", "tooltips")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");
    
    /*
      SEQUENCE IS THE FOLLOWING:
      1. the collection listen to Router event 'loadData' when url hashstring parsed
      2. the model listen to collection 'loaded' event when data are loaded (data itself + lookup tables)
      3. the views listen to model change when data attribute is updated by model (when data loaded and bundled)
         and render subviews: histogram, map, barchart, ...
      4. the router parse url hash string and trigger the app. chain: router -> collection -> model -> main view -> sub views
    */
    Vis.Collections.app = new Vis.Collections.App();
    new Vis.Views.App({model: new Vis.Models.App});
    //new Vis.Views.App();
    new Vis.Routers.App();

    if (!Backbone.history.started) {
      Backbone.history.start({pushState: false});
      Backbone.history.started = true;
    }
  }
};