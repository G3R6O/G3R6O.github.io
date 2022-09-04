window.onresize = () => {
  location.reload();
}
// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 90, left: 40 },
  width = document.getElementById('project1').offsetWidth - margin.left - margin.right,
  height = document.getElementById('project1').offsetHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#project1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
// Define the div for the tooltip
let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
let databinding = d3.json("data.json").then(function (data) {

  // X axis
  const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.Q))
    .padding(0.2);
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")

    .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.SX + d.Y3; })])
    //.range([ height, 0]);
    .range([height, 0]);
  var yAxis = d3.axisLeft()
    .scale(y)
    .tickFormat(function (d) {
      if ((d / 1000) >= 1) {
        d = d / 1000 + "K";
      }
      return d;
    })
    ;

  svg.append("g")
    .call(yAxis)
    .attr("class", "axisBlue")
    ;

  // Add Y2 axis
  const y2 = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.price; })])
    //.range([ height, 0]);
    .range([height, 0]);
  var y2Axis = d3.axisRight()
    .scale(y2);

  svg.append("g")
    .attr("transform", `translate(${width},0)`)
    .call(y2Axis)
    .attr("class", "axisGrey")
    ;
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("# cars produced")
    .attr("fill", "steelblue");
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", width-20)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("stock price")
    .attr("fill", "grey");
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height +60)
    .text("quarters");
  // Bars
  svg.selectAll('.mybar')
    .data(data)
    .join("rect")
    .attr("x", d => x(d.Q))
    .attr("width", x.bandwidth() / 2)
    .attr("fill", "steelblue")
    .classed('mybar', true)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("fill", "#ff6f3c");
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html("<b> " + d.Q + "</b> <br/>" + "S/X: " +
        d.SX.toLocaleString('en') + "<br/> 3/Y: " + d.Y3.toLocaleString('en')
        + "<br/><b>  " + (d.Y3 + d.SX).toLocaleString('en') + "</b>")
        .style("left", (event.pageX) - 35 + "px")
        .style("top", (event.pageY - 100) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).transition()
        .duration(500).attr("fill", "steelblue");
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    // no bar at the beginning thus:
    .attr("height", d => height - y(0)) // always equal to 0
    .attr("y", d => y(0))
    .attr("on")
  // Animation 1
  svg.selectAll('.mybar')
    .transition()
    .duration(250)
    .delay(function (d, i) { return i * 100; })
    .attr("y", d => y(d.SX + d.Y3))
    .attr("height", d => height - y(d.SX + d.Y3))

  //price

  svg.selectAll('.mybar2')
    .data(data)
    .join("rect")
    .attr("x", d => x(d.Q) + x.bandwidth() / 2)
    .attr("width", x.bandwidth() / 2)
    .attr("fill", "grey")
    .classed('mybar2', true)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("fill", "#ff6f3c");
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html("<b> " + d.Q + "</b> <br/>" + "Avg. price: <br/><b>" +
        d.price.toLocaleString('en') + "</b>")
        .style("left", (event.pageX) - 35 + "px")
        .style("top", (event.pageY - 100) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).transition()
        .duration(500).attr("fill", "grey");
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    // no bar at the beginning thus:
    .attr("height", d => height - y(0)) // always equal to 0
    .attr("y", d => y2(0))
    .attr("on")
  // Animation 1
  svg.selectAll('.mybar2')
    .transition()
    .duration(250)
    .delay(function (d, i) { return i * 100; })
    .attr("y", d => y2(d.price))
    .attr("height", d => height - y2(d.price))

})