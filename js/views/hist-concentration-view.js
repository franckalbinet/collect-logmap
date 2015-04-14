Vis.Views.HistConcentration = Backbone.View.extend({

  	el: '#hist-concentration-view',

    dim: null,
    grp: null,

    doseExtent: null,
    countExtent: null,

    chartId: null,
    chart: null,

    format: null,
    
    events: {
      "click a.reset": "clearFilter"
    },

    initialize: function () {  
      var that = this;

      this.dim = this.model.get("data").dims.dose;
      this.grp = this.model.get("data").grps.dose;
      this.doseExtent = function() { return d3.extent(this.grp.top(Infinity), function(d) { return d.key; }) };

      // create chart
      if(this.chart) d3.select(this.chartId).select("svg").remove();
      this.createChart();

      this.format = function (value, precision) {
        var precision = precision || 0;
        if (isNaN(value)) return "";
        if (value instanceof Date) return d3.time.format("%e %b %Y")(value);

        var formatted = null;
        var prefix = d3.formatPrefix(value);
        formatted = (Number.isInteger(prefix.scale(value))) ?
          prefix.scale(value) + prefix.symbol :
          prefix.scale(value).toFixed(precision) + prefix.symbol;
        return formatted;
      };

      // chart brush event listeners
      this.chart.on("filtered", function(brush) { 
        (brush.empty()) ?
          that.$el.find("a.reset").hide():
          that.$el.find("a.reset").show();
        Backbone.trigger("filtered:histogram");
      });
      this.chart.on("filtering", function(brush) { 
        var extent = brush.extent();
        if (brush.extent()[0] < 1) extent = [0, extent[1]];

        (brush.empty()) ?
          that.dim.filterAll():
          that.dim.filter(extent);        
        
        Backbone.trigger("filtering:histogram");
      });

      // listen to other charts filtered events
      Backbone.off(null, null, this);
      Backbone.on("filtering:barchart filtering:map filtered:substance filtered:foodstuffs", 
        function(d) { that.render(); }, this);
    },

    render: function() {   
      d3.select(this.chartId).call(this.chart); 
    },

    createChart: function() {
      var that = this;
      this.chartId = "#" + this.$el.find("[id$=-chart]").attr("id");
      
      this.chart = d3.myHistogram()
        .width(560).height(100)
        .margins({top: 5, right: 10, bottom: 30, left: 40})
        .group(this.grp)
        .x(d3.scale.log().domain([0.8, this.doseExtent()[1]]))
        .y(d3.scale.linear())
        .xAxis(d3.svg.axis().orient("bottom").ticks(10, "s"))
        .yAxis(d3.svg.axis().orient("left").ticks(3));

      this.render();
      //d3.select(this.chartId).call(this.chart);   
    },

    clearFilter: function(e) {
      e.preventDefault();
      this.chart.clearBrush();
    }
  });
