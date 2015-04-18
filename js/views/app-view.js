Vis.Views.App = Backbone.View.extend({

    el: '#app',
    
    initialize: function () {
      this.model.on("change:data", this.render, this);
      //this.render();
    },

    render: function() {
      var that = this;

      $("#data-loading").css("display", "none");
      this.$el.css("display", "block");

      new Vis.Views.TimeEmulator({ el: '#parallel-coodinates-view', model: this.model});
      new Vis.Views.ParallelCoordinates({ el: '#parallel-coodinates-view', model: this.model});
      new Vis.Views.Map({ el: '#map-collected-vs-planned'});
      new Vis.Views.Map({ el: '#map-collected-vs-collectors'});
      new Vis.Views.Map({ el: '#map-analysed-vs-collected'});
      new Vis.Views.Map({ el: '#map-analysed-vs-labs'});


      /*
      this.updateSwitch();

      if(this.countTime != undefined) {
        this.countTime.initialize();
        this.histConcentration.initialize();
        this.substanceType.initialize();
        this.map.initialize();
        this.foodstuffType.initialize();
        this.dataSummary.initialize();
        this.dataList.initialize();        
      } else {
        this.countTime = new Vis.Views.CountTime({model: this.model});
        this.histConcentration = new Vis.Views.HistConcentration({model: this.model});
        this.substanceType = new Vis.Views.SubstanceType({model: this.model});
        this.map = new Vis.Views.Map({model: this.model});
        this.foodstuffType = new Vis.Views.FoodstuffType({model: this.model});
        this.dataSummary = new Vis.Views.DataSummary({model: this.model});
        this.dataList = new Vis.Views.DataList({model: this.model});
      }
      */
    },

    updateSwitch: function() {  
      var file = this.model.get("data").file.split(".")[0];
      $(this.$el).find("#switch-dataset a").removeClass("selected");
      $(this.$el).find("#" + file).addClass("selected");
    }
  });
