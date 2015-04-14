/* 
  CREATE HEXBIN MAP LAYER INSTANCE
  Setters and getters:
    .group() 
    .radius()
    .colorScale()
    .colorRule()
    .clearBrush() - without argument. Clear brush as name indicates
*/

d3.myHexBinLayer = function() {

  var map = null,
      radius = 7,
      colorScale = null,
      colorRule = null,
      group = null;

  var _svg = null,
      _width = null,
      _height = null,
      _path = null,
      _gHex = null,
      _gBrush = null,
      _hexbin = null,
      _brush = d3.svg.brush(),
      _brushExtent = {nw: 0, se: 0},
      _zoom = 0,
      _data = null,
      _listeners = d3.dispatch("filtered", "filtering");

  // determine if point: [lat, lon] is within brush region extent {nw: [lat, lon], se: [lat, lon]}
  var _inBrush = function (point, extent) {
    var betweenWE = false,
        betweenNS = false;

    // longitude cases
    if (0 < extent.nw[1]  && extent.se[1] < 0) {
      betweenWE = (0 <= point[1]) ?
        (extent.nw[1] <= point[1]  && point[1] <= extent.se[1] + 360) :
        (extent.nw[1] <= point[1] + 360 && point[1] + 360 <= extent.se[1] + 360);
    } else {
      betweenWE = (extent.nw[1] <= point[1] && point[1] <= extent.se[1]);
    }

    // latitude case
    betweenNS = (extent.se[0] <= point[0] && point[0] <= extent.nw[0]);

    return betweenNS && betweenWE;
  };

  function chart(div, options) {
    var options = options || {redrawBrush: true};

    // prepare data
    _data = group.top(Infinity)
      .filter(function(d) {
        return d.value.data != -1
      })
      .map(function(d){ 
        var point = _project(d.value.lat, d.value.lon);
        return {
          value: d.value.data,
          lat: d.value.lat,
          lon: d.value.lon,
          x: point.x,
          y: point.y
        }
    });
    
    // only at first call
    if (!_gHex) _initialize(this);

    // create brush
    if (options.redrawBrush) {
      if (_gBrush) _svg.select(".brush").remove(); 
     
      _brush = d3.svg.brush()
        .x(d3.scale.identity().domain([-map._getMapPanePos().x, _width - map._getMapPanePos().x]))
        .y(d3.scale.identity().domain([-map._getMapPanePos().y, _height - map._getMapPanePos().y]));

      _brush.on("brushend", function() {
          _listeners.filtered(_brush); 
      });

      _brush.on("brush", function() {
          var extent = _brush.extent();
          var nw = map.layerPointToLatLng((L.point(extent[0][0], extent[0][1])));
          var se = map.layerPointToLatLng((L.point(extent[1][0], extent[1][1])));
          _brushExtent.nw = [nw.lat, nw.lng];
          _brushExtent.se = [se.lat, se.lng];

          // update hexagons opacity
          _render();

          // trigger "filtering" event to filter dim
          _listeners.filtering({
            empty: function() { return _brush.empty(); },
            extent: function() { return _brushExtent; },
            within: _inBrush
          });
      });
      
      _gBrush = _svg.append("g")
        .attr("class", "brush")
        .call(_brush);
    }

    // EXIT - ENTER - UPDATE PATTERN
    // join data
    _zoom = map.getZoom();

    _render();

    function _project(lat, lon) {
      return map.latLngToLayerPoint(new L.LatLng(lat, lon));
    };

    function _render() {
      var hexagons = _gHex.selectAll("path")
          .data(_hexbin(_data), function(d) { return _zoom + "," + d.i + "," + d.j; });

      // if new dataset is smaller than the old one  -- remove
      hexagons.exit().remove();

      // if new dataset is larger
      hexagons.enter().append("path")
        .attr("d", _hexbin.hexagon())
        .style("fill", function(d) { return colorScale(colorRule(d)); })
        .style("fill-opacity", 0.6)
        .style("stroke", "black")
        .style("stroke-opacity", 0.2)
        .style("stroke-width", 0.5) 
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      // if new dataset same size
      hexagons
        .style("fill", function(d) { return colorScale(colorRule(d)); })
        .style("fill-opacity", function(d) {
          if (_brush.empty()) {
            return 0.6;
          } else {
            var lat = map.layerPointToLatLng(L.point(d.x,d.y)).lat;
            var lon = map.layerPointToLatLng(L.point(d.x,d.y)).lng;
            var opacity = (_inBrush([lat, lon], _brushExtent)) ? 0.6 : 0.2;  
            return opacity;
          } 
        });
    }

    function _initialize(selection) {
      // initialize the Leaflet SVG layer
      map._initPathRoot();
      _svg = selection.select("svg"); 
      _width = map.getSize().x;
      _height = map.getSize().y;
      _path = d3.geo.path().projection(_project);

      // init hexbin
      _hexbin = d3.hexbin()
        .size([_width, _height])
        .radius(radius)
        .x(function(d) { return d.x})
        .y(function(d) { return d.y});

      // create hexagons paths container
      _gHex = _svg.append("g").attr("class", "hexagons");  
    }
    
  }
 
  // Getters and Setters
  chart.map = function(_) {
    if (!arguments.length) return map;
    map = _;
    return chart;
  };
  chart.radius = function(_) {
    if (!arguments.length) return radius;
    radius = _;
    return chart;
  };
  chart.group = function(_) {
    if (!arguments.length) return group;
    group = _;
    return chart;
  };
  chart.colorScale = function(_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return chart;
  };
  chart.colorRule = function(_) {
    if (!arguments.length) return colorRule;
    colorRule = _;
    return chart;
  };
  chart.clearBrush= function(_) {
    if (!arguments.length) {
      _gBrush.call(_brush.clear());
      // trigger programmatically brush event
      _brush.event(_gBrush);
    }
    return chart;
  };
  chart.on = function (event, listener) {
    _listeners.on(event, listener);
    return chart;
  };
  chart.inBrush = function(_) {
    if (!arguments.length) return _inBrush;
    _inBrush = _;
    return chart;
  };

  return chart;
};
