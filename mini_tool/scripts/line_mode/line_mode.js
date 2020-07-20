/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 * 
 * This file implements the line graph functionality for line_mode.ejs including the process of both requesting data
 * from the server as well as utilizing that data to draw the line graphs the user chooses. User input is processed in
 * line_mode_lib.js.
 */

// svg object utilized for holding the line graphs
var svg;

//
var valueline;

//
var max = 0;

// current lines that have been drawn
var currLines = new Set();

// last color that was used
var lastColor = 0;

// available colors - what if user chooses more than 8?
var colors = [
  "#3A6BC1",
  "#A5A5A5",
  "#65A1D8",
  "#FFC000",
  "#ED7C30",
  "#63A536",
  "#993E01",
  "#1A3A71",
];

// descriptions of the graphs that have been drawn. This maps a string of the server's query result to a description
// of said data for the user using the helper function convertSelectionToTest().
var descriptions = new Map();

// holds the textbox where description should be set (cleared whenever user hovers off of line, and then filled when
// user hovers over a line)
var descriptionTextBox;

/**
 * Function that is used to retrieve server data as long as the query being run would be new.
 *
 * @param {boolean} starting tells us whether wwe are starting the webpage
 */
function getDataFromServer(starting) {
  if (d3.select("#line").size() != 0 && !starting && !shouldRunNewQuery()) {
    return;
  }
  fetch("/lineModeData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // stringify an array containing the inputs from the HTML elements
    body: JSON.stringify({
      div: currDivision,
      ownership: currOwnership,
      length: currLength,
      isr1: currIsR1,
      jobType: currJobType,
      beazones: Array.from(currBEAZones),
      careerareas: Array.from(currCareerAreas),
    }),
  })
    .then((response) => {
      return response.json();
    })
    // data received from server is still dumped into console (but can easily be visualized using jsonFromServer)
    .then((jsonFromServer) => {
      console.log(jsonFromServer);
      drawLineGraph(jsonFromServer);
      descriptions.set(
        JSON.stringify(jsonFromServer),
        convertSelectionToText()
      );
    });
}

/**
 * Clears the graph
 */
function clear() {
  d3.select("#graph-holder")
    .selectAll("*")
    .remove();
}

/**
 * When the user hovers over a given graph line, the data that the line represents will be displayed in a textarea.
 * This function utilizes the global variables that store the current user input selections to create a string for
 * storage and future use when the user hovers over a specific line graph.
 *
 * @return String representation of user's current input
 */
function convertSelectionToText() {
  var description =
    (currDivision == "unrestricted" ? "" : "division: " + currDivision + "\n") +
    (currOwnership == "unrestricted" ? "" : currOwnership + "\n") +
    (currLength == "unrestricted" ? "" : currLength + "\n") +
    (currIsR1 ? "R1 only \n" : "") +
    (currJobType == "unrestricted" ? "" : currJobType + "\n") +
    (currBEAZones.size == 0
      ? ""
      : "BEA Zones: " + Array.from(currBEAZones).join(" ") + "\n") +
    (currCareerAreas.size == 0
      ? ""
      : "Career areas: " + Array.from(currCareerAreas).join(" "));
  if (description == "") {
    return "All postdoc jobs";
  } else {
    return description;
  }
}

/**
 * Draws a line graph into the respected div given the rows of the SQL query whose results will be displayed.
 *
 * @param {SQL Query Rows} data the rows of the SQL query
 */
function drawLineGraph(data) {
  // Now the same graph won't be drawn twice
  //if (descriptions.has(JSON.stringify(data))) {
  //  return;
  //}
  var lineDrawn = false;
  currLines.forEach(function (v) {
    if (JSON.stringify(data) == JSON.stringify(v)) {
      lineDrawn = true;
    }
  });
  if (!lineDrawn) {
    currLines.add(data);
  }
  clearAxes();
  lastColor = (lastColor - (currLines.size - 1)) % colors.length;
  if (lastColor < 0) {
    lastColor = lastColor + colors.length;
  }
  d3.selectAll("#line").remove();
  max = 0;
  // set the dimensions and margins of the graph
  var graphHolderWidth = parseFloat(((d3.select("#graph-holder")).style("width")).substring(0, ((d3.select("#graph-holder")).style("width")).length));
  var graphHolderHeight = parseFloat(((d3.select("#graph-holder")).style("height")).substring(0, ((d3.select("#graph-holder")).style("height")).length));

  var margin = { top: 40, right: 20, bottom: 30, left: 50 },
    width = graphHolderWidth - margin.left - margin.right,
    height = graphHolderHeight - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line
  valueline = d3
    .line()
    .x(function (d) {
      return x(d.year);
    })
    .y(function (d) {
      return y(d.count);
    });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin

  if (d3.select("svg").size() == 0) {
    svg = d3
      .select("#graph-holder")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  } else {
    svg = d3
      .select("#graph-holder")
      .select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  // Scale the range of the data
  x.domain(
    d3.extent(data, function (d) {
      return d.year;
    })
  );

  currLines.forEach(function (d) {
    for (var i = 0; i < d.length; i++) {
      max = Math.max(max, d[i].count);
    }
  });

  y.domain([0, Math.ceil(1.2 * max)]);

  //add the title
  svg
    .append("text")
    .text("Post-Doc Jobs By Year")
    .attr("transform", "translate(250,0)")
    .style("font-size", "1.5vw");

  currLines.forEach(function (d) {
    addPath(d, svg, valueline);
  });

  // Add the X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("id", "xAxis")
    .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

  // Add the Y Axis
  svg
    .append("g")
    .call(d3.axisLeft(y))
    .attr("id", "yAxis");
}

/**
 *
 * @param {*} data
 * @param {*} svg
 * @param {*} valueline
 */
function addPath(data, svg, valueline) {
  lastColor = (lastColor + 1) % colors.length;
  svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("id", "line")
    .attr("value", JSON.stringify(data))
    .attr("d", valueline)
    .attr("fill", "none")
    .attr("stroke", colors[lastColor])
    .attr("stroke-width", "4px")
    .on("click", function () {
      max = 0;
      var d1 = JSON.parse(this.attributes[2].value);
      currLines.forEach(function (d) {
        if (JSON.stringify(d) == JSON.stringify(d1)) {
          currLines.delete(d);
        }
      });
      d3.select(this).remove();
      d3.select("#description").html("")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke-width", "8px");
      d3.select("#description").html(
        descriptions.get(this.attributes[2].value)
      );
      d3.select("#" + d3.select(this).attr("id") + "_text").attr(
        "font-size",
        "14pt"
      );
      d3.select("#" + d3.select(this).attr("id") + "_text").attr(
        "font-variant",
        "small-caps"
      );
      d3.select("#" + d3.select(this).attr("id") + "_legend").attr(
        "height",
        "4"
      );
    })
    .on("mouseout", function () {
      d3.select("#description").html("");
      d3.select(this).attr("stroke-width", "4px");
      d3.select("#" + d3.select(this).attr("id") + "_text").attr(
        "font-size",
        "12pt"
      );
      d3.select("#" + d3.select(this).attr("id") + "_text").attr(
        "font-variant",
        "normal"
      );
      d3.select("#" + d3.select(this).attr("id") + "_legend").attr(
        "height",
        "2.4"
      );
    });
}

/**
 * Removes all lines from the graph (implements clear button functionality on EJS file)
 */
function clearGraph() {
  currLines.clear();
  d3.selectAll("#line").remove();
  max = 0;
}

/**
 * Clears the axes on the graph
 */
function clearAxes() {
  d3.selectAll("#xAxis").remove();
  d3.selectAll("#yAxis").remove();
}
