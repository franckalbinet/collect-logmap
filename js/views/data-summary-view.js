Vis.Views.DataSummary = Backbone.View.extend({

  	el: '#data-summary-view',

    format: null, 

    initialize: function () {  
      var that = this;

      this.format = function (value, precision) {
        if (isNaN(value)) return "";
        if (value instanceof Date) return d3.time.format("%e %b %Y")(value);

        var formatted = null;
        var prefix = d3.formatPrefix(value);
        formatted = (Number.isInteger(prefix.scale(value))) ?
          prefix.scale(value) + prefix.symbol :
          prefix.scale(value).toFixed(precision) + prefix.symbol;
        return formatted;
      }

      this.render();

      // listen to other charts filtered events
      Backbone.off(null, null, this);
      Backbone.on("filtering:barchart filtering:map filtering:histogram filtered:substance filtered:foodstuffs", 
        function(d) { that.render();}, this);
    
    },
    render: function() {
      var that = this;

      var data = this.model.get("data").dims;
    
      var all = this.model.get("data").cf.size();
      var selected = data.dose.top(Infinity).length;
      var accessor = function(d){return d.dose;};

      var min = d3.round(d3.min(data.dose.top(Infinity), accessor));
      var median = d3.round(d3.median(data.dose.top(Infinity), accessor));
      var mean = d3.round(d3.mean(data.dose.top(Infinity), accessor));
      //var deviation = d3.round(d3.deviation(data, accessor));
      var max = d3.round(d3.max(data.dose.top(Infinity), accessor));
      var from = d3.extent(data.time.top(Infinity), function(d) {return d.date;})[0];
      var to = d3.extent(data.time.top(Infinity), function(d) {return d.date;})[1];


      _updateText("#all", all);
      _updateText("#selected", selected);
      _updateText("#min", min);
      _updateText("#median", median);
      _updateText("#mean", mean);
      //_updateText("#deviation", deviation);
      _updateText("#max", max);
      _updateText("#from", from);
      _updateText("#to", to);

      function _updateText(id, value) {
        that.$el.find(id).text(that.format(value, 2));
      }
    }
  });