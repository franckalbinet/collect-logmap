Vis.Views.ParallelCoordinates = Backbone.View.extend({

    chartId: null,
    chart: null,
    data: null,
    highlighted: null,

    events: {
    },

    initialize: function () {  
      var that = this;

      this.chartId = "#" + this.$el.find("[id$=-chart]").attr("id");

      this.data = this.model.get("data").data
        .filter(function(d) {return d.period == 0});

      this.createChart();
      
      this.render();
      
      this.model.on("change:period", function() {
        var period = this.get("period");
        that.data = this.get("data").data.filter(function(d) {return d.period == period});
        that.chart.data(that.data);
        that.render();
      });

      // trigger event on point hovering to sync other charts
      this.chart.on("hovered", 
        function(featureId) {        
          Backbone.trigger("hovered:parallelCoordinates", {name: featureId});
        }
      );

      // update points appearance on other/own charts hovering
      Backbone.on("hovered:scatterplot hovered:parallelCoordinates hovered:choropleth", 
        function(d) {
          this.chart.highlight(d.name);
          this.render();
        }
      ,this);

    },

    render: function() {    
      d3.select(this.chartId).call(this.chart);
    },

    createChart: function() {
      var that = this;

      this.chart = d3.myParallelCoordinates()
        .width(360)
        .height(340)
        .margins({top: 30, left:0, bottom: 10,right: 10})
        .data(that.data)
        .dimensions(["planned", "collected", "analysed"]);       
    },

    updateChart: function() {
    }

    
  });