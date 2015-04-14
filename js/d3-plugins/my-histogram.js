/* 
  CREATE HISTOGRAM INSTANCE

  Setters and getters:
    .width()
    .height() 
    .margins() - ex: marginss({top: 10, right: 25, bottom: 30, left: 20})
    .x() - ex: x(d3.scale.sqrt().domain([myDomain])) range is deduced from witdh and marginss
    .y() - ex: y(d3.scale.sqrt().domain([myDomain])) range is deduced from height and marginss
    .xAxis()
    .yAxis()
    .clearBrush() - without argument. Clear brush as name indicates
    .setBrush() - passing [rangeMin, rangeMax] will set the brush and trigger brush events
*/

d3.myHistogram = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      group = null,
      x = d3.scale.linear(),
      y = d3.scale.linear(),
      xAxis = d3.svg.axis().orient("bottom"), 
      yAxis = d3.svg.axis().orient("left")
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

      var data = reduceCountByKey(group);
      
      // create the skeleton chart
      if (g.empty()) _skeleton();

      // update/set y scale domain
      y.domain([0, d3.max(data, function(d) { return d.y; })])

      // set y axis
      _gYAxis.transition().duration(200).call(yAxis);

      _render();

      function _render() {
        // EXIT - ENTER - UPDATE PATTERN
        // join data and bars
        var rects =  _gBars.selectAll("rect")
          .data(data, function(d) { return d.x; });

        // if new dataset is smaller than the old one  -- remove
        rects.exit().transition().remove();

        // if new dataset is larger
        rects.enter().append("rect")
            .attr("x", function(d) { 
              return x(d.x); })
            .attr("y", function(d) { return y(d.y); })
            .attr("width", function(d) { return x(d.dx + d.x) - x(d.x) + 1; })
            .attr("height", function(d) { return _gHeight - y(d.y); });

         // if new dataset same size
        rects
          .transition()
          .attr("y", function(d) { return y(d.y); })   
          .style("fill", function(d) {
              var colour = "#7499B7";
              //var colour = "#aaa";
              if (!brush.empty()) {
                var extent = brush.extent();
                var barCenter = d.x + d.dx/2;
                if (!(extent[0] <= barCenter && barCenter <= extent[1])) colour = "#e3eaf0";
                //if (!(extent[0] <= barCenter && barCenter <= extent[1])) colour = "#eee";
              }
              return colour;
          }) 
          .attr("height", function(d) { return _gHeight - y(d.y); });
        }

        function _skeleton(){
          // set scales range 
          x.range([0, _gWidth]); 

          //x.tickFormat(2, ".2f");

          y.range([_gHeight, 0])
            .domain([0, d3.max(data, function(d) { return d.y; })])

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
            .attr("transform", "translate(0," + (_gHeight + 2) + ")")
            .call(xAxis);

          _gYAxis = g.append("g" )
            .attr("class", "y axis")
            .call(yAxis);

          _gBrush = g.append("g").attr("class", "brush").call(brush);
          _gBrush.selectAll("rect").attr("height", _gHeight);    
          _gBrush.selectAll(".resize rect")
            .style("visibility", "visible")
            .attr("width", "2px")
            .attr("x", "-1px");
        }

      // listening brush events
      // throttling brush event in order not to overload browser
      var _throttled = _.throttle(_listeners.filtering, 0);
      brush.on("brush", function() { 
        _render();
        //_listeners.filtering(brush);
        _throttled(brush); 
      });
      brush.on("brushend", function() { _listeners.filtered(brush); });
    });
  }

  function reduceCountByKey(group) {
    var data = {};
    group.top(Infinity).forEach(function(d) {
      if((d.value.x) in data) {
        data[d.value.x].y += d.value.y;     
      } else {
        data[d.value.x] = {x: d.value.x, dx: d.value.dx, y: d.value.y};
      }
    })
    return _.values(data);
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
      // trigger programmatically brush event
      brush.event(_gBrush);
    }
    return chart;
  };
  chart.setBrush= function(_) {
    if (arguments.length) {
      _gBrush.call(brush.extent(_));
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