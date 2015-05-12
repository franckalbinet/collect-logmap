/* 
  CREATE PARALLEL COORDINATES INSTANCE

  Setters and getters:
    .width()
    .height() 
    .margins() - ex: marginss({top: 10, right: 25, bottom: 30, left: 20})
    .data()
    .dimensions() - ex: ["planned", "collected", "analysed"]
    .x()
    .y()
    .highlight()
*/

d3.myParallelCoordinates = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      data = null,
      highlight = null,
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
      _listeners = d3.dispatch("hovered");

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

        // Background
        // join data 
        var background = _gBackground.selectAll("path")
          .data(data, function(d) {
            return d.name + "-" + d.period});

        // if new dataset is smaller than the old one  -- remove
        background.exit().remove();

         // if new dataset is larger
        background
          .enter().append("path")
            .attr("d", _path)
            .on("mouseover", function(d, i) {
              _listeners.hovered(d.name); 
              Vis.DEFAULTS.D3_TOOLTIP.html(d.name).style("visibility", "visible")
            })
            .on("mouseout", function(d, i) {
              _listeners.hovered(null);
              Vis.DEFAULTS.D3_TOOLTIP.html(d.name).style("visibility", "hidden");
            })
            .on("mousemove", function(d) {
              Vis.DEFAULTS.D3_TOOLTIP.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            });
            
        // Foreground
        // join data 
        var foreground = _gForeground.selectAll("path")
          .data(data, function(d) {
            return d.name + "-" + d.period});

        // if new dataset is smaller than the old one  -- remove
        foreground.exit().remove();

        // if new dataset is larger
        foreground
          .enter().append("path")
            .attr("d", _path);
           
        // if new dataset same size
        foreground
          .style("stroke", function(d) {
            var stroke = d3.rgb(4, 90, 141);
            if (highlight) {
              stroke = (d.name === highlight) ? d3.rgb(4, 90, 141) : d3.rgb(210, 210, 210);
            }
            return stroke;
          })
          .style("stroke-width", function(d) {
            var strokeWidth = 0.4;
            if (highlight) {
              strokeWidth = (d.name === highlight) ? 1.5 : 0.4;
            }
            return strokeWidth;
          });
     
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

        //_gLines = g.append("g").attr("class", "lines");
        _gForeground = g.append("g").attr("class", "foreground");
        _gBackground = g.append("g").attr("class", "background");

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