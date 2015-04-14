/* 
  CREATE ROWCHART INSTANCE
  Setters and getters:
    .width()
    .margins() - ex: margins({top: 10, right: 25, bottom: 30, left: 20})
    .group() 
    .x() - ex: x(d3.scale.sqrt().domain([myDomain])) range is deduced from witdh and margins
    .barHeight() - in pixels
    .xAxis()
*/

d3.myRowchart = function() {

  var width = 200,
      height = 600,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      group = null,
      x = null,
      y = null,
      barHeight = 20,
      xAxis = d3.svg.axis().orient("bottom"),
      lookupNames = null;

  var _gWidth = 400,
      _gHeight = 100,
      _gBars,
      _gBrush,
      _gXAxis,
      _listeners = d3.dispatch("filtered", "filtering");

  function chart(div) {
    height = barHeight * group.top(Infinity).length;
    _gWidth = width - margins.left - margins.right;
    _gHeight = height - margins.top - margins.bottom;

    div.each(function() {
      var div = d3.select(this),
          g = div.select("g");

      // create the skeleton chart.
      if (g.empty()) _skeleton();

      _gXAxis.transition().duration(300).call(xAxis);

      // EXIT - ENTER - UPDATE PATTERN
      // join data and bars
      var rects =  _gBars.selectAll("rect")
        .data(group.top(Infinity), function(d) { return d.key; });

      // if new dataset is smaller than the old one  -- remove
      rects.exit().transition().remove();

      // if new dataset is larger
      rects.enter().append("rect")
        .attr("x", 0)
        .attr("width", function(d) {return x(d.value); })
        .attr("y", function (d, i) { return i * barHeight; })
        .attr("height", barHeight - 2);
     
      // if new dataset same size
      rects
          .transition()
          .attr("width", function(d) {return x(d.value); })

      function _skeleton(){
        // set scale range
        x.range([0 , _gWidth]);
        
        // set axis
        xAxis.scale(x);
    
        // create chart container
        g = div.append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        _gBars = g.append("g").attr("class", "bars");

        // set x Axis
        _gXAxis = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,-2)")
            .call(xAxis);
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
  chart.barHeight = function(_) {
    if (!arguments.length) return barHeight;
    barHeight = _;
    return chart;
  };
  chart.lookupNames = function(_) {
    if (!arguments.length) return lookupNames;
    lookupNames = _;
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
