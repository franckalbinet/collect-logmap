Vis.Views.Scatterplot = Backbone.View.extend({

    xAttr: null,
    xScale: null,
    yAttr: null,
    yScale: null,
    xTitle: null,
    yTitle: null,

    chart: null,
    data: null,
    highlighted: null,
    that: null,

    events: {
    },

    initialize: function (options) {  
      var that = this;

      this.xAttr = options.xAttr;
      this.yAttr = options.yAttr;
      this.xScale = options.xScale;
      this.yScale = options.yScale;
      this.xTitle = options.xTitle;
      this.yTitle = options.yTitle;

      
      this.model.on("change:period", function() {
        var period = this.get("period");
        that.data = this.get("data").data.filter(function(d) {return d.period == period});
        that.chart.data(that.data);
        that.render();
      });

      this.data = this.model.get("data").data.filter(function(d) {return d.period == 0});
      this.initChart();
    
      // trigger event on point hovering to sync other charts
      this.chart.on("hovered", 
        function(featureId) {        
          Backbone.trigger("hovered:scatterplot", {name: featureId});
        }
      );

      // update points appearance on other/own charts hovering
      Backbone.on("hovered:scatterplot hovered:parallelCoordinates hovered:choropleth", 
        function(d) {
          this.chart.highlight(d.name);
          this.render();
        }
      ,this);

      this.render();
    },

    render: function() {
      d3.select(this.el).call(this.chart); 
    },

    initChart: function() {
      var that = this;
      
      this.chart = d3.myScatterPlotChart()
        //.width(360)
        .width(555)
        .height(300)
        .margins({top: 20, right: 20, bottom: 20, left: 40})
        .data(that.data)
        .xAttr(that.xAttr)
        .yAttr(that.yAttr)
        .x(that.xScale)
        .y(that.yScale)
        .xTitle(that.xTitle)      
        .yTitle(that.yTitle);      
    }
  });