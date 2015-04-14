Vis.Views.FoodstuffType = Backbone.View.extend({

  	el: '#foodstuff-type-view',

    dimension: null,
    group: null,
    values: null,

    itemTemplate: _.template($(".foodstuffs-items").html(), {variable: 'data'}),

    foodstuffsNames: null,
  
    initialize: function () {  
      var that = this;

      this.$el.find("#foodstuffs-select").multiselect({
        buttonWidth: "100%",
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        filterPlaceholder: 'Search foodstuffs ...',
        filterBehavior: "text",
        includeFilterClearBtn: true,
        buttonClass: "btn btn-xs",
        maxHeight: 800,
        optionLabel: function(element) {
          var isZero = (+$(element).attr('data-count') == 0 )? " is-zero" : ""; 
          return "<span class='badge" + isZero + "'" + ">" + $(element).attr('data-count') + "</span></a>" + $(element).html();
          //return "<span class='badge " + isZero + ">" + $(element).attr('data-count') + "</span></a>" + $(element).html();
        },
        onChange: function(option, checked, select) {
          that.filter();
        },
        onSelectAll: function() {
          that.filter();
        },
        onDropdownShow: function(event) {
          var selected = that.getSelected().map(function(d) {return d.toString()});
          that.update();
          that.$el.find("#foodstuffs-select").multiselect('select', selected);
        }
      });

      this.dimension = this.model.get("data").dims.foodstuff
      this.group = this.model.get("data").grps.foodstuff;
      this.foodstuffsNames = this.model.get("data").foodstuff;

      this.update();
      this.selectAll();

    },

    update: function() {
      this.$el.find("select").empty();
      this.$el.find("select").html(this.itemTemplate(this.getValues()));
      this.$el.find("#foodstuffs-select").multiselect("rebuild");
    },

    filter: function() {    
      var selected = this.getSelected();
      this.dimension.filter(function(d){
         return selected.indexOf(d) > -1;
      });

      Backbone.trigger("filtered:foodstuffs");
    },

    selectAll: function() {
      this.$el.find("#foodstuffs-select").multiselect("selectAll", false);
      this.$el.find("#foodstuffs-select").multiselect("updateButtonText");
    },

    getSelected: function() {
      var selectedItems = [];
      $("#foodstuff-type-view li.active input").each(function( index ) {
        var value = $(this).val().trim();
        if ((value) && value != "multiselect-all") selectedItems.push(+value);
      });
      return selectedItems;
    },

    getValues: function() {
      var that = this;
      return  this.group.top(Infinity)
        //.filter(function(d) { 
        //  return d.value != 0; })
        .map(function(d) { 
          return {optValue: d.key, name: that.foodstuffsNames[d.key], count: d.value };
      });
    }
  });