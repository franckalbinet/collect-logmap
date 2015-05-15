Vis.Views.TimeEmulator = Backbone.View.extend({

    timer: null,
    counterIdx: 0,

    events: {
      "click .play": "updateStatus"
    },

    initialize: function () {  
      this.$el.find(".badge").text((this.model.get("period") + 1) + " / " + Vis.DEFAULTS.NB_PERIODS_SIMULATED.length);     
    },

    updateStatus: function(event) {
      var that = this;
      event.preventDefault();

      var textSelector = $(event.currentTarget).find(".status");
      var glyphiconSelector = $(event.currentTarget).find("span.glyphicon");
      var badgeTextSelector = $(event.currentTarget).find(".badge");

      if (this.model.get("timeBtnStatus") == "pause") {
        textSelector.text("Pause");
        glyphiconSelector.removeClass("glyphicon-play");
        glyphiconSelector.addClass("glyphicon-pause");
        this.model.set("timeBtnStatus", "play");
        this.timer = setInterval(function(){ 
          that.counterIdx++;
          that.model.set("period", that.counterIdx % (Vis.DEFAULTS.NB_PERIODS_SIMULATED.length)); 
          badgeTextSelector.text( (that.model.get("period") + 1) + " / " + Vis.DEFAULTS.NB_PERIODS_SIMULATED.length);
        }, Vis.DEFAULTS.PERIOD_SPEED);
      } else {
        textSelector.text("Play");
        glyphiconSelector.removeClass("glyphicon-pause");
        glyphiconSelector.addClass("glyphicon-play");
        this.model.set("timeBtnStatus", "pause");
        clearInterval(this.timer);
      }
    }
  });