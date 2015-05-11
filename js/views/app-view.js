Vis.Views.App = Backbone.View.extend({

    el: '#app',
    colors: null,
    
    initialize: function () {
      this.model.on("change:data", this.render, this);
      this.colors = ['rgb(189,201,225)','rgb(116,169,207)','rgb(43,140,190)','rgb(4,90,141)'];
    },

    render: function() {
      var that = this;

      $("#data-loading").css("display", "none");
      this.$el.css("display", "block");

      new Vis.Views.ParallelCoordinates({ el: '#parallel-coordinates-view', model: this.model});

      new Vis.Views.Map({ 
        el: '#map-collected-vs-planned',
        model: this.model,
        scale: d3.scale.threshold()
          .range(that.colors)
          .domain([25, 50, 75]),
        accessor: function(d) { return parseInt(d.properties.collected * 100 / d.properties.planned); },
        legendTitle: "In %"
      });
      
      new Vis.Views.Map({ 
        el: '#map-analysed-vs-collected', 
        model: this.model,
        scale: d3.scale.threshold()
          .range(that.colors)
          .domain([25, 50, 75]),
        accessor: function(d) { return parseInt(d.properties.analysed * 100 / d.properties.collected); },
        legendTitle: "Analysed / Collected in %"
      });
      
      new Vis.Views.Scatterplot({ 
        el: '#scatterplot-collected-vs-collectors',
        model: this.model,
        xScale: d3.scale.linear().domain([0, Vis.DEFAULTS.MAX_COLLECTORS]),
        yScale: d3.scale.linear().domain([0, Vis.DEFAULTS.MAX_PLANNED]),
        xAttr: "collectors",
        yAttr: "collected",
        xTitle: "Nb. collectors",
        yTitle: "Nb. collected samples"
      });

      new Vis.Views.Scatterplot({ 
        el: '#scatterplot-analysed-vs-labs',
        model: this.model,
        xScale: d3.scale.linear().domain([0, Vis.DEFAULTS.MAX_LABS]),
        yScale: d3.scale.linear().domain([0, Vis.DEFAULTS.MAX_PLANNED]),
        xAttr: "labs",
        yAttr: "analysed",
        xTitle: "Nb. laboratories",
        yTitle: "Nb. analysed samples"
      });
          
      new Vis.Views.TimeEmulator({ 
        el: '#time-emulator-view', 
        model: this.model});
      
    },

    getBins: function(max, nbBins) {
      var pow = Math.pow(10, Math.floor(Math.log(max / nbBins) / Math.LN10 + 1) - 1);
      var width = parseInt((max / nbBins) / pow) * pow;
      return d3.range(1, nbBins).map(function(d) { return d * width; });
    }
  });
