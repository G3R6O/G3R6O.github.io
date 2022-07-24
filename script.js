
// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 90, left: 40},
    width = 500 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#project1")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let databinding = d3.json("data.json").then(function(data){
 
// X axis
const x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(d => d.year))
  .padding(0.2);
svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Add Y axis
const y = d3.scaleLinear()
  .domain([0,d3.max(data, function(d) { return d.value; })])
  //.range([ height, 0]);
  .range([ height, 0]);

svg.append("g")
  .call(d3.axisLeft(y));
  
// Bars
svg.selectAll("mybar")
  .data(data)
  .join("rect")
    .attr("x", d => x(d.year))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue")
    // no bar at the beginning thus:
   .attr("height", d => height - y(0)) // always equal to 0
   .attr("y", d => y(0))


// Animation
svg.selectAll("rect")
  .transition()
  .duration(1500)
  .attr("y", d => y(d.value))
  .attr("height", d => height - y(d.value)) 

// data label
svg.selectAll(".text")        
  .data(data)
  .enter()
  .append("text")
  .attr("class","label")
  .attr("x", (function(d) { return x(d.year); }))
  .attr("y", function(d) { return y(d.value); })
  .attr("dy", "1.2em")
  .attr("dx", ".8em")
  .text(function(d) { return d.value; })
  .style('fill', 'white');
})
