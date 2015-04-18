Vis.Views.ParallelCoordinates = Backbone.View.extend({

    chartId: null,
    chart: null,
    data: null,

    events: {
    },

    initialize: function () {  
      var that = this;

      this.chartId = "#" + this.$el.find("[id$=-chart]").attr("id");

      // will be dynamic selection of period later on 
      this.data = this.model.get("data").data.filter(function(d) {return d.period == 9  });
      this.render();
    },

    render: function() {
      var that = this;

      this.chart = d3.parcoords()(this.chartId)
        .width(780)
        .height(380)
        .margin({top: 30, left:0, bottom: 10,right: 10})
        .data(that.data)
        //.alpha(0.2)
        //.composite("destination-atop")
        .shadows()
        .detectDimensions()
        .dimensions(["labs","analysed","planned","collected","collectors"])
        .render()
        .ticks(5)
        .brushMode("1D-axes")
        .createAxes();

        // get planned domain first
        // update scales
        // re-render
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
      this.chart.ctx.highlight.lineWidth = 1;

      this.chart.render().reorderable().updateAxes();

      this.chart.on("brush", function(d) {
        if(_.isEmpty(this.brushExtents())) {
          this.unhighlight(d);
        } else {
          this.highlight(d);
        }
      });

      /*
      this.chart.on("highlight", function(d){
        //this.highlight(d)
        console.log(d)
      });
      */

      //this.chart.ctx.foreground.strokeStyle = "#f00";
      //this.chart.ctx.shadows.strokeStyle = "#00f";
      //this.chart.ctx.shadows.strokeStyle = "#00f";


      var bp = null;
      

    },

    initChart: function() {

    }

    
  });