/* 
  CREATE SCATTERPLOT INSTANCE
  Setters and getters:
    .width()
    .height() 
    .margins() - ex: margins({top: 10, right: 25, bottom: 30, left: 20})
    .group() 
    .x() - ex: x(d3.scale.sqrt().domain([myDomain])) range is deduced from witdh and margins
    .y() - ex: y(d3.scale.sqrt().domain([myDomain])) range is deduced from height and margins
    .xAxis()
    .yAxis()
    .clearBrush() - without argument. Clear brush as name indicates
    .setBrush() - passing [rangeMin, rangeMax] will set the brush and trigger brush events
*/

d3.myScatterPlotChart = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      group = null,
      x = null,
      y = null,
      xAxis = d3.svg.axis().orient("bottom"), 
      yAxis = d3.svg.axis().orient("left"),
      brush = d3.svg.brush();

  var _gWidth = 400,
      _gHeight = 100,
      _gBars,
      _gBrush,
      _gYAxis,
      _listeners = d3.dispatch("filtered", "filtering");

  function chart(div) {
    _gWidth = width - margins.left - margins.right;
    _gHeight = height - margins.top - margins.bottom;

    div.each(function() {
      var div = d3.select(this),
          g = div.select("g");

      // create the skeleton chart.
      if (g.empty()) _skeleton();

      _gYAxis.transition().duration(300).call(yAxis);

      _render();

      function _render() {
        // EXIT - ENTER - UPDATE PATTERN
        // join data and bars
        var rects =  _gBars.selectAll("rect")
          .data(group.top(Infinity), function(d) { return d.key; });

        // if new dataset is smaller than the old one  -- remove
        rects.exit().transition().remove();

        // if new dataset is larger
        rects.enter().append("rect")
            .attr("x", function(d) { 
              return x(d.key) - barWidth/2; })
            .attr("width", function(d) { return barWidth })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return _gHeight - y(d.value); });

        // if new dataset same size
        rects
            .transition()
            .attr("y", function(d) { 
              return y(d.value); })
              .style("fill", function(d) {
              var colour = "#7499B7";
              if (!brush.empty()) {
                var extent = brush.extent();
                if (!(extent[0] <= d.key && d.key <= extent[1])) colour = "#e3eaf0";
              } 
              return colour;
            }) 
            .attr("height", function(d) { return _gHeight - y(d.value); });
      }

      function _skeleton(){
        // set scales range
        x.range([0 , _gWidth]);
        y.range([_gHeight, 0]);
        
        // set brush
        brush.x(x);
        
        // set axis
        xAxis.scale(x);
        yAxis.scale(y);

        // create chart container
        g = div.append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        _gBars = g.append("g").attr("class", "bars");

        // set x Axis
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," +  (_gHeight + 2) + ")")
            .call(xAxis);

        // set y Axis
        _gYAxis = g.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        _gBrush = g.append("g").attr("class", "brush").call(brush);
        _gBrush.selectAll("rect").attr("height", _gHeight); 
        _gBrush.selectAll(".resize rect")
          .style("visibility", "visible")
          .attr("width", "2px")
          .attr("x", "-1px");


        // listening & throttling brush events in order not to overload browser
        var _throttled = _.throttle(_listeners.filtering, 0);
        brush.on("brush", function() { 
          _render();
          //_listeners.filtering(brush);
          _throttled(brush); 
        });
        brush.on("brushend", function() { _listeners.filtered(brush); });
      } 
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
  chart.group = function(_) {
    if (!arguments.length) return group;
    group = _;
    return chart;
  };
  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return chart;
  };
  chart.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };
  chart.barWidth = function(_) {
    if (!arguments.length) return barWidth;
    barWidth = _;
    return chart;
  };
  chart.xAxis = function(_) {
    if (!arguments.length) return xAxis;
    xAxis = _;
    return chart;
  };
  chart.yAxis = function(_) {
    if (!arguments.length) return yAxis;
    yAxis = _;
    return chart;
  };
  chart.clearBrush= function(_) {
    if (!arguments.length) {
      _gBrush.call(brush.clear());
      brush.event(_gBrush);
    }
    return chart;
  };
  chart.setBrush= function(_) {
    if (arguments.length) {
      _gBrush.call(brush.extent(_));
      // trigger programmatically brush event
      brush.event(_gBrush);
    }
    return chart;
  };
  chart.on = function (event, listener) {
    _listeners.on(event, listener);
    return chart;
  };

  return chart;
};
