Vis.Views.SubstanceType = Backbone.View.extend({

  	el: '#substance-type-view',

    dim: null,
    grp: null,

    doseExtent: null,
    countExtent: null,

    chartId: null,
    chart: null,
    
    events: {
      "click a.btn": "switch"
    },

    initialize: function () {  
      var that = this;

      this.dim = this.model.get("data").dims.substance;
      this.grp = this.model.get("data").grps.substance;

      this.filter(+this.$el.find(".btn.selected").attr("id"));
    },

    switch: function(event) {
      event.preventDefault();

      this.$el.find(".btn").removeClass("selected");
      $(event.currentTarget).addClass("selected");
      this.filter(+event.currentTarget.id);
    },
    
    filter: function(value) {
      this.dim.filter(value);
      Backbone.trigger("filtered:substance");
    }
  });