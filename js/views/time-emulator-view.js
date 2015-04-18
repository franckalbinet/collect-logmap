Vis.Views.TimeEmulator = Backbone.View.extend({

   
    events: {
      "click .play": "updateStatus"
    },

    initialize: function () {  
      //this.updateStatus
      var bp = null;
     
    },

    render: function() {},

    updateStatus: function(event) {
      event.preventDefault();
      var textSelector = $(event.currentTarget).find(".status");
      var glyphiconSelector = $(event.currentTarget).find("span.glyphicon");


      if (this.model.get("timeBtnStatus") == "pause") {
        textSelector.text("Pause");
        glyphiconSelector.removeClass("glyphicon-play");
        glyphiconSelector.addClass("glyphicon-pause");
        this.model.set("timeBtnStatus", "play");
      } else {
        textSelector.text("Play");
        glyphiconSelector.removeClass("glyphicon-pause");
        glyphiconSelector.addClass("glyphicon-play");
        this.model.set("timeBtnStatus", "pause");
      }

      var bp = null;
    }
    
  });