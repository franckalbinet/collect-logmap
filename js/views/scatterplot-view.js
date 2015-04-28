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

      this.render();

      /*
      Backbone.on("featureIn featureOut", function(selected) {
          this.updateChart();
          if (selected.length != 0) {
            this.highlighted = this.data.filter(function(d) { return d.name == selected[0]; }),
            this.chart.highlight(this.highlighted);
          } else {
            this.chart.unhighlight(this.highlighted);
          }
        }
        ,this
      );
      */
      
    },

    render: function() {
      d3.select(this.el).call(this.chart); 
    },

    initChart: function() {
      var that = this;
      
      this.chart = d3.myScatterPlotChart()
        //.width(555)
        .width(360)
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