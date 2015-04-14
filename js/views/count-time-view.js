Vis.Views.CountTime = Backbone.View.extend({

    el: '#count-time-view',

    dim: null,
    grp: null,

    timeExtent: null,
    countExtent: null,

    chartId: null,
    chart: null,
    
    events: {
      "click a.reset": "clearFilter"
    },

    initialize: function () {  
      var that = this;

      this.dim = this.model.get("data").dims.time;
      this.grp = this.model.get("data").grps.time;
      this.timeExtent = function() { return d3.extent(this.grp.top(Infinity), function(d) {return d.key;})};
      this.countExtent = function() { return d3.extent(this.grp.top(Infinity), function(d) {return d.value;})};

      // create chart
      if(this.chart) d3.select(this.chartId).select("svg").remove();
      this.createChart();

      // chart brush event listeners
      this.chart.on("filtered", function(brush) { 
        (brush.empty()) ?
          that.$el.find("a.reset").hide():
          that.$el.find("a.reset").show();
        Backbone.trigger("filtered:barchart");
      });
      this.chart.on("filtering", function(brush) { 
        (brush.empty()) ?
          that.dim.filterAll():
          that.dim.filter(brush.extent());  
        Backbone.trigger("filtering:barchart");
      });

      // listen to other charts filtered events
      Backbone.off(null, null, this);
      Backbone.on("filtering:histogram filtering:map filtered:substance filtered:foodstuffs", 
        function(d) {
          that.chart.y().domain([0, that.countExtent()[1]]);
          that.render();  
        }, this);
    },

    render: function() {    
      d3.select(this.chartId).call(this.chart);
    },

    createChart: function() {
      this.chartId = "#" + this.$el.find("[id$=-chart]").attr("id");

      this.chart = d3.myBarChart()
        .width(560).height(100)
        .margins({top: 5, right: 10, bottom: 30, left: 40})
        .group(this.grp)
        .barWidth(5)
        .x(d3.time.scale().domain(this.timeExtent()).nice())
        .y(d3.scale.sqrt().domain(this.countExtent()))      
        .xAxis(d3.svg.axis().orient("bottom").ticks(4))
        .yAxis(d3.svg.axis().orient("left").ticks(3));

      d3.select(this.chartId).call(this.chart);
    },

    clearFilter: function(e) {
      e.preventDefault();
      this.chart.clearBrush();
    }
    


  });