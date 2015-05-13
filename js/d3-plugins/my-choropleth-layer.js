/* 
  CREATE CHOROPLETH LAYER INSTANCE

  Setters and getters:
    .map() - leaflet container map
    .data()
    .scale()
    .accessor()
*/

d3.myChoroplethLayer = function() {

  var map = null,
      data = null,
      scale = null,
      accessor = null,
      highlight = null;

  var _svg = null,
      _gChoropleth = null,
      _zoom = 0,
      _path = null,
      _listeners = d3.dispatch("hovered");

  function chart(div) {

    // only at first call
    if (!_gChoropleth) _initialize(this);

    _zoom = map.getZoom();

    _render();

    function _render() {
      // EXIT - ENTER - UPDATE PATTERN
      // Data join
      var paths = _gChoropleth.selectAll("path")
          .data(data, function(d) { 
            //console.log(d.id + "-" + _zoom);
            return d.id + "-" + _zoom; });

      // if new dataset is smaller than the old one  -- remove
      paths.exit().remove();

      // if new dataset is larger
      paths.enter().append("path")
        .attr("d", _path)
        .attr("class", "choropleth")
        .style("fill", function(d) { 
          return scale(accessor(d)); 
        })
        .on("mouseover", function(d) {
          _listeners.hovered(d.id); 
          //this.parentNode.appendChild(this);
          Vis.DEFAULTS.D3_TOOLTIP.html(d.id).style("visibility", "visible");
        })
        .on("mouseout", function(d, i) {
          _listeners.hovered(null);
          Vis.DEFAULTS.D3_TOOLTIP.html(d.id).style("visibility", "hidden");
        })
        .on("mousemove", function(d) {
          Vis.DEFAULTS.D3_TOOLTIP.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        });

      // if same size
      paths
        .style("fill", function(d) {
          return scale(accessor(d)); })
        .style("stroke", function(d) {
          var stroke = 0.7;
          if (highlight) {
            stroke = (d.id === highlight) ? "rgb(221, 100, 100)" : "#000" ;
            if (d.id === highlight) this.parentNode.appendChild(this);
          }
          return stroke;
        })
        .style("stroke-width", function(d) {
          var width = "0.5px";
          if (highlight) {
            width = (d.id === highlight) ? "3px" : "0.5px" ;
          }
          return width;
        })
        .style("stroke-opacity", function(d) {
          var opacity = 0.2;
          if (highlight) {
            opacity = (d.id === highlight) ? 0.8 : 0.2;
            //this.parentNode.appendChild(this);
          }
          return opacity;
        });       
        /*   
        .style("fill-opacity", function(d) {
          var opacity = 0.7;
          if (highlight) {
            opacity = (d.id === highlight) ? 0.7 : 0.4;
          }
          return opacity;
        });
*/
        
      
    }

    function _initialize(selection) {
      // initialize the Leaflet SVG layer
      map._initPathRoot();
      _svg = selection.select("svg"); 

      // create choropleth paths container
      _gChoropleth = _svg.append("g").attr("class", "choropleths");  

      _path = d3.geo.path().projection(function project(x) {
          var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
          return [point.x, point.y];
      });

    }    
  }

  // Getters and Setters
  chart.map = function(_) {
    if (!arguments.length) return map;
    map = _;
    return chart;
  };
  chart.data = function(_) {
    if (!arguments.length) return data;
    data = _;
    return chart;
  };
  chart.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };
  chart.accessor = function(_) {
    if (!arguments.length) return accessor;
    accessor = _;
    return chart;
  };
  chart.highlight = function(_) {
    if (!arguments.length) return highlight;
    highlight = _;
    return chart;
  };
  chart.on = function (event, listener) {
    _listeners.on(event, listener);
    return chart;
  };

  return chart;
};