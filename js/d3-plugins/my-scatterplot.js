/* 
  CREATE SCATTERPLOT INSTANCE
  Setters and getters:
    .width()
    .height() 
    .margins() - ex: margins({top: 10, right: 25, bottom: 30, left: 20})
    .data() 
    .xAttr()
    .yAttr()
    .x() - ex: x(d3.scale.sqrt().domain([myDomain])) range is deduced from witdh and margins
    .y() - ex: y(d3.scale.sqrt().domain([myDomain])) range is deduced from height and margins
    .xTitle()
    .yTitle()
    .xAxis()
    .yAxis()
    .clearBrush() - without argument. Clear brush as name indicates
    .setBrush() - passing [rangeMin, rangeMax] will set the brush and trigger brush events
*/

d3.myScatterPlotChart = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},

      //group = null,
      x = null,
      y = null,
      xAttr = null,
      yAttr = null,
      xTitle = null,
      yTitle = null,
      xAxis = d3.svg.axis().orient("bottom"), 
      yAxis = d3.svg.axis().orient("left"),
      brush = d3.svg.brush();

  var _gWidth = 400,
      _gHeight = 100,
      _gPoints,
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

      //_gYAxis.transition().duration(300).call(yAxis);
      _render();

      function _render() {

        // create Voronoi -- for smarter point picker -- ref to http://bl.ocks.org/njvack/1405439
        if (!g.select("#point-paths").empty()) g.select("#point-paths").remove();
        var paths = g.append("g").attr("id", "point-paths");

        var voronoi = d3.geom.voronoi()
          .x(function(d) { 
            return x(d[xAttr]); })
          .y(function(d) { return y(d[yAttr]); })
          .clipExtent([[0, 0], [_gWidth, _gHeight]]);

        paths.selectAll("path")
            .data(voronoi(data))
          .enter().append("path")
            .attr("d", function(d) { 
              if(d !== undefined) return "M" + d.join(",") + "Z"; 
            })
            .attr("id", function(d,i) { 
              return "path-"+i; })
            //.attr("clip-path", function(d,i) { return "url(#clip-"+i+")"; })
            //.style("fill", d3.rgb(230, 230, 230))
            .style('fill-opacity', 0)
            .style('stroke-opacity', 0)
            .style("stroke", d3.rgb(100,0,0));

        paths.selectAll("path")
          .on("mouseover", function(d, i) {
            //d3.select(this)
            //.style('fill', d3.rgb(31, 120, 180));
            g.selectAll(".dots")
              .attr("fill-opacity", 0.2);
            g.select("circle#point-"+i)
              .attr("fill-opacity", 1)
              .transition()
              .duration("100")
              .attr("r", 8);
          })
          .on("mouseout", function(d, i) {
            //d3.select(this)
            //.style("fill", d3.rgb(230, 230, 230));
            g.selectAll(".dots")
              .attr("fill-opacity", 1);
            g.select("circle#point-"+i)
              .transition()
              .duration("500")
              .attr("r", 3);
          });
        
             
        // EXIT - ENTER - UPDATE PATTERN for points
        // join data and dots
        var dots = _gPoints.selectAll("circle")
          .data(data, function(d) { return d.name + d.period; });

        // if new dataset is smaller than the old one  -- remove
        dots.exit().remove();

        // if new dataset is larger
        dots.enter().append("circle")
          .attr("class", "dots")
          .attr("id", function(d, i) { 
            return "point-" + i; })
          .attr("r", 3)
          .attr("cx", function(d) { 
            return x(d[xAttr]); })
          .attr("cy", function(d) { return y(d[yAttr]); })
          .style("fill", "steelblue");
         
        // if new dataset same size
      }

      function _skeleton(){
        // set scales range
        x.range([0 , _gWidth]);
        y.range([_gHeight, 0]);
        
        // set brush
        //brush.x(x);
        
        // set axis
        xAxis.scale(x);
        yAxis.scale(y);

        // create chart container
        g = div.append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        _gPoints = g.append("g").attr("id", "points");

        // set x Axis
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," +  _gHeight + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", _gWidth)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(xTitle);

        // set y Axis
        _gYAxis = g.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yTitle);

        /*    
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
        */
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
  chart.data = function(_) {
    if (!arguments.length) return data;
    data = _;
    return chart;
  };
  chart.xAttr = function(_) {
    if (!arguments.length) return xAttr;
    xAttr = _;
    return chart;
  };
  chart.yAttr = function(_) {
    if (!arguments.length) return yAttr;
    yAttr = _;
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
  chart.xTitle = function(_) {
    if (!arguments.length) return xTitle;
    xTitle = _;
    return chart;
  };
  chart.yTitle = function(_) {
    if (!arguments.length) return yTitle;
    yTitle = _;
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
