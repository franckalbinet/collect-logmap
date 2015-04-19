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

      this.model.on("change:period", function() {
        var period = this.get("period");
        that.data = this.get("data").data.filter(function(d) {return d.period == period});
        that.updateChart();
      });

      this.data = this.model.get("data").data.filter(function(d) {return d.period == 0});
      this.initChart();

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
      
    },

    initChart: function() {
      var that = this;

      this.chart = d3.parcoords()(this.chartId)
        .width(780)
        .height(340)
        .margin({top: 30, left:0, bottom: 10,right: 10})
        .data(that.data)
        .shadows()
        .detectDimensions()
        .dimensions(["labs","analysed","planned","collected","collectors"])
        .render()
        .ticks(5)
        .brushMode("1D-axes")
        .createAxes();

      var maxPlanned = d3.max(that.data, function(d) {return d.planned})

      // update Y scales domains
      _.mapObject(this.chart.yscale, function(val, key) {
        var currentDomain = val.domain();
        var newDomain = (key == "collected" || key =="analysed") ? 
          [0, maxPlanned]:
          [0, currentDomain[1]];
        return val.domain(newDomain) ;
      });

      // Update dimension label y position
      d3.selectAll("svg g.dimension text.label").attr("dy", -8);

      this.chart.ctx.shadows.lineWidth = 0.4;
      this.chart.ctx.foreground.lineWidth = 0.4;
      this.chart.ctx.highlight.lineWidth = 1.5;

      this.chart.render().reorderable().updateAxes();

      // update brush handles width
      d3.selectAll("svg g.resize rect").attr("height", "4").attr("y", "-2");

      this.chart.on("brush", function(d) {
        if(_.isEmpty(this.brushExtents())) {
          this.unhighlight(d);
           Backbone.trigger("pcBrushing", []);
        } else {
          this.highlight(d);
          Backbone.trigger("pcBrushing", d.map(function(d) {return d.name;}));
        }
      });          
    },

    updateChart: function() {
      this.chart.brushReset();
      Backbone.trigger("pcBrushing", []);
      this.chart.unhighlight(this.chart.highlighted());
      this.chart.data(this.data);
      this.chart.render();
    }

    
  });