/* 
  CREATE SCATTERPLOT INSTANCE
  Setters and getters:
    ...
*/

d3.myScatterPlotChart = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      data = null,
      highlight = null,
      x = null,
      y = null,
      xAttr = null,
      yAttr = null,
      xTitle = null,
      yTitle = null,
      xAxis = d3.svg.axis().orient("bottom"), 
      yAxis = d3.svg.axis().orient("left");

  var _gWidth = 400,
      _gHeight = 100,
      _gPoints,
      _gBrush,
      _gYAxis,
      _listeners = d3.dispatch("hovered");

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
            .style('fill-opacity', 0)
            .style('stroke-opacity', 0)
            .style("stroke", d3.rgb(100,0,0));

        paths.selectAll("path")
          .on("mouseover", function(d, i) {
            _listeners.hovered(d.point.name); 
            Vis.DEFAULTS.D3_TOOLTIP.html(d.point.name).style("visibility", "visible");
            
            /*            
            delete path
            if highlight
            then draw line

            g.append("path").attr("class")
            x(d.point[xAttr])
            y(d.point[yAttr])

            d3.select("#scatterplot-collected-vs-collectors svg")
              .append("path")
              .attr("d", "M50 50 H200V200")
              .style("stroke", "#000")
              .style("stroke-width", "2px")
              .style("fill", "none");
            */
          })
          .on("mouseout", function(d, i) {
            _listeners.hovered(null);
            Vis.DEFAULTS.D3_TOOLTIP.html(d.point.name).style("visibility", "hidden");
          })
          .on("mousemove", function(d) {
            Vis.DEFAULTS.D3_TOOLTIP.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
          });
          
        // coordinates path
        g.select(".coord-path").remove();    
        if (highlight) {
          var point = data.filter(function(d) {return d.name === highlight;})[0];    
          g.append("path")
            .attr("class", "coord-path")
            .attr("d", "M" + x(0) + " " + y(point[yAttr]) + "H" + x(point[xAttr]) + "V" + y(0)) 
            .style("stroke", "rgba(0,0,0,0.5)")
            .style("stroke-width", "1px")
            .style("fill", "none")
            .style("stroke-dasharray","2,2")
            .style("shape-rendering", "crispEdges");
        }

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
        dots
          .style("fill-opacity", function(d) {
            var opacity = 1;
            if (highlight) {
              opacity = (d.name === highlight) ? 1 : 0.4;
            }
            return opacity;
          })
          .transition()
          .duration("100")
          .attr("r", function(d) {
            var radius = 3;
            if (highlight) {
              radius = (d.name === highlight) ? 8 : 3;
            }
            return radius;
          })
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
            .style("font-size", "11px")
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
            .style("font-size", "10px")
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yTitle);
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
  chart.highlight = function(_) {
    if (!arguments.length) return highlight;
    highlight = _;
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
  chart.on = function (event, listener) {
    _listeners.on(event, listener);
    return chart;
  };

  return chart;
};
