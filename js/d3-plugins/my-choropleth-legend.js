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
      colorScale = null,
      title = null,
      heightClassRect = 15;

  var _gWidth = 400,
      _gHeight = 100,
      _data = null,
      _xDomain = null,
      _x = null,
      _heightClass = 15,
      _xAxis = d3.svg.axis().orient("bottom").tickFormat(d3.format("s"));

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
      _xDomain = [0].concat(colorScale.domain());
      _x = d3.scale.ordinal()
        .domain(_xDomain)
        .rangeRoundPoints([0, _gWidth]);

      var rectWidth = _x.range()[1] - _x.range()[0];

      _data = d3.zip(_xDomain, colorScale.range());

      g.selectAll("rect")
          .data(_data)
          .enter()
        .append("rect")
          .style("fill", function(d) {return d[1];})
          .style("fill-opacity", 0.7)
          .attr("x", function(d) {return _x(d[0]);})
          .attr("width", rectWidth)
          .attr("height", heightClassRect);

      // scale
      _xAxis.scale(_x);
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
  chart.colorScale = function(_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
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