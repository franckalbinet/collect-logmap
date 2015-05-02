/* 
  CREATE PARALLEL COORDINATES INSTANCE

  Setters and getters:
    .width()
    .height() 
    .margins() - ex: marginss({top: 10, right: 25, bottom: 30, left: 20})
*/

d3.myParallelCoordinates = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      data = null,
      dimensions = [],
      x = d3.scale.ordinal(),
      y = {};

  var _gWidth = 400,
      _gHeight = 100,
      _axis = d3.svg.axis().orient("left").ticks(5),
      _gYAxis,
      _gLines,
      _gDimensions,
      _line = d3.svg.line(),
      _listeners = d3.dispatch("filtered", "filtering");

  function chart(div) {
    
    _gWidth = width - margins.left - margins.right;
    _gHeight = height - margins.top - margins.bottom;

    div.each(function() {
      var div = d3.select(this),
          g = div.select("g");

      // create the skeleton chart
      if (g.empty()) _skeleton();

      _render();

      function _render() {
        
        // EXIT - ENTER - UPDATE PATTERN
        // join data 
        var lines = _gLines.selectAll("path")
          .data(data, function(d) {
            //console.log(this);
            return d.name + "-" + d.period});

        // if new dataset is smaller than the old one  -- remove
        lines.exit().remove();

        // if new dataset is larger
        lines
          .enter().append("path")
            .attr("d", _path);

        
        // returns the path for a given data point
        function _path(d) {
          return _line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }
          
      }

      function _skeleton(){

        // create chart container
        g = div.append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        // set x scale
        x.rangePoints([0, _gWidth], 1).domain(dimensions);

        // set y scales
        dimensions.forEach(function(d) {
          y[d] = d3.scale.linear()
            .domain([0, d3.max(data, function(p) { return +p["planned"]; })])
            .range([_gHeight, 0]);
        });

        _gLines = g.append("g").attr("class", "lines");

        // add a group element for each dimension
        _gDimensions = g.selectAll(".dimension")
            .data(dimensions)
          .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })

        // add an axis and title
        _gDimensions.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(_axis.scale(y[d])); })
          .append("text")
            .style("text-anchor", "middle")
            .attr("y", -13)
            .text(function(d) { return d; });

      }

      /*
      // listening brush events
      // throttling brush event in order not to overload browser
      var _throttled = _.throttle(_listeners.filtering, 0);
      brush.on("brush", function() { 
        _render();
        //_listeners.filtering(brush);
        _throttled(brush); 
      });
      brush.on("brushend", function() { _listeners.filtered(brush); });
      */
    });

  }

  // Getters and Setters
  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };
  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };
  chart.margins = function(_) {
    if (!arguments.length) return margins;
    margins = _;
    return chart;
  };
  chart.data = function(_) {
    if (!arguments.length) return data;
    data = _;
    return chart;
  };
  chart.dimensions = function(_) {
    if (!arguments.length) return dimensions;
    dimensions = _;
    return chart;
  };
  chart.on = function (event, listener) {
    _listeners.on(event, listener);
    return chart;
  };

  return chart;
};