Vis.Routers.App = Backbone.Router.extend({

  routes: {
  	//"file/*path": "file"
  	"*path":"load"
  },

  load: function() {
  
  	$("#data-loading").css("display", "block");
  	$("#app").css("display", "none");
  	
  	Backbone.trigger("loadData");
  }

});
