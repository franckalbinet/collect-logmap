/* 
  CREATE CHOROPLETH LEGEND INSTANCE
  Setters and getters:
    .width()
    .height() 
    .margins() - ex: margins({top: 10, right: 25, bottom: 30, left: 20})
    .colorScale()
*/

d3.myChoroplethLegend = function() {

  var width = 400,
      height = 100,
      margins = {top: 10, right: 25, bottom: 30, left: 20},
      scale = null,
      ticks = null,
      tickFormat = null,
      colors = null,
      title = null,
      heightClassRect = 15;

  var _gWidth = 400,
      _gHeight = 100,
      _data = null,
      _xDomain = null,
      //_x = null,
      _heightClass = 15,
      _xAxis = d3.svg.axis().orient("bottom");

  function chart(div) {
    _gWidth = width - margins.left - margins.right;
    _gHeight = height - margins.top - margins.bottom;

    div.each(function() {
      var div = d3.select(this),
          g = div.select("g");

      g = div.append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");    
      
      // define x scale
      // if ordinal scale
      if (scale.rangeRoundBands !== undefined) {
        scale
          .domain(ticks)
          .rangeRoundPoints([0, _gWidth]);
        var rectWidth = scale.range()[1] - scale.range()[0];
        _data = d3.zip(scale.domain().slice(0,-1), colors);
      // or quantitative: linear, ...  
      } else {
        // to be finalized ... 
        /*
        scale
          .domain(d3.extent(ticks))
          .range([0, _gWidth]);
        var rectWidth = scale(ticks[1]) - scale(ticks[0]);
        _data = d3.zip(ticks.slice(0,-1), colors);
        _xAxis.tickValues(ticks);
        */
      }

      g.selectAll("rect")
          .data(_data)
          .enter()
        .append("rect")
          .style("fill", function(d) {return d[1];})
          .style("fill-opacity", 0.7)
          .attr("x", function(d) {return scale(d[0]);})
          .attr("width", rectWidth)
          .attr("height", heightClassRect);
      
      // scale
      _xAxis.tickFormat(tickFormat);

      _xAxis.scale(scale);
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," +  heightClassRect + ")")
        .call(_xAxis);

      // legend title
      g.append("text")
        .text(title)
        .attr("class", "title")
        .attr("dy", -10);
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
  chart.ticks = function(_) {
    if (!arguments.length) return ticks;
    ticks = _;
    return chart;
  };
  chart.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return chart;
  };
  chart.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };
  chart.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return chart;
  };
  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };
  chart.heightClassRect = function(_) {
    if (!arguments.length) return heightClassRect;
    heightClassRect = _;
    return chart;
  };
 
  return chart;
};