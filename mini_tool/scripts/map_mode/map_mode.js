/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 * 
 * This file is primarily used for sending a specific SQL query to the server to then be used to populate the map. 
 * It utilizes the functions in map_mode_lib which work with the HTML element input elements in map_mode.ejs.
 */

// newest json data - out of state - (this does not include states with no results)
var serverData;
// json data onload (contains all jobs of all states)
var oldServerData
// current visibility factor is decided at 1.1
var VISIBILITY_FACTOR = 1.01
// the custom coloration for a state that was clicked on
var clickedRGB = "rgb(186, 25, 0)"
var Rscale = 71
var Gscale = 186
var Bscale = 83

// last state that was clicked on
var lastState = null

// global variable for display mode (state = true, beazone = false)
var stateMode = true;

/**
 * This function updates the map that is currently displayed on the webpage as long as the
 * user has entered new data on the webpage HTML's elements or that (starting = true). 
 * 
 * @param {boolean} starting this variable should be true if running this onload and false 
 * otherwise. This is to override the "should run new query" check that is otherwise done
 * by this function.
 */
function updateMap(starting) {
  // if not onload and the HTML data has not changed, return immediately 
  if (!starting && !shouldRunNewQuery()) {
    return;
  }

  // Logging the HTML data from the webpage (either last or curr versions can be used)
  // console.log("SLIDER DATA: " + lastValidYear1 + " " + lastValidYear2)
  // console.log("DIVISION SELECT DATA: " + lastDivision)
  // console.log("INST OWNERSHIP " + lastOwnership)
  // console.log("INST LENGTH " + lastLength)
  // console.log("INST R1 " + lastIsR1)
  // console.log("JOB TYPE : " + lastJobType)
  // console.log("SELECTED SUBJECTS DATA: " + Array.from(lastCareerAreas).join(" "))

  disableResetButton();

  // sending data at /jobsMode over POST as JSON
  fetch("/mapsModeData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // stringify an array containing the inputs from the HTML elements
    body: JSON.stringify({
      "year1": lastValidYear1,
      "year2": lastValidYear2,
      "div": lastDivision,
      "ownership": lastOwnership,
      "length": lastLength,
      "isr1": lastIsR1,
      "jobType": lastJobType,
      "careerareas": Array.from(lastCareerAreas),
      "stateMode": stateMode 
    })
  })
    .then((response) => {
      return response.json();
    })
    // data received from server is still dumped into console (but can easily be visualized using jsonFromServer)

    // the data is formatted in the following manner from the server:
    // an array of Json objects where each object is a (key, value) pair with the key being the state name
    // and the value being the number of jobs associated with that state.

    .then((jsonFromServer) => {

      // logging to client for debugging
      // console.log("client received from server @ /jobsModeData");
      // console.log("JOBS DATA PER STATE:");
      // console.log(jsonFromServer);
      oldServerData = jsonFromServer;
      serverData = jsonFromServer;
      // runs d3 data visualization to generate the graph
      // -1 here indicates that there is no internal index for a "clicked" state yet
      if (stateMode){
        drawData(-1);
      } else {
        drawBeazones(jsonFromServer)
      }


    });
}

/*
 * This function returns the maxinimum number of jobs any one state has.
 * We mulitply this result by a visibility factor in order to give the map colors more readability
 */
function getMaxJobs() {
  var maxJobs = 0;
  for (var i = 0; i < serverData.length; i++) {
    maxJobs = Math.max(serverData[i].count, maxJobs);
  }
  return maxJobs * VISIBILITY_FACTOR;
}

/*
 * This function calculates the scaled RGB to use for coloration of each state.
 * json tuple "state" - the state that needs to be colored
 * int max jobs       - the maximum number of jobs of any particular state multiplied by some visibility factor
 */
function getScaledRGB(state, maxJobs) {
  // invert the scaling factor colors so that it is white based and not black based
  var scalingFactor = 1 - state.count / (1.0 * maxJobs);
  return (
    "rgb(" +
    (scalingFactor * Rscale) +
    ", " +
    (scalingFactor * Gscale)+
    ", " +
    (scalingFactor * Bscale)+
    ")"
  );
}

/*
 * This function gets the query state from the serverData in order to calculate its stats
 * D3 Object d3_state - the state that we need to match
 */
function getQueryState(d3_state) {
  for (var i = 0; i < serverData.length; i++) {
    if (serverData[i].state === d3_state.properties.name) {
      return serverData[i];
    }
  }
  return null;
}

function drawBeazones(jsonFromServer) {
  // change the color of each state here
  d3.selectAll(".country").style("fill", function (d) {
    return getBEAZoneColor(getBEAZone(d.properties.name));
  });


  // remove all the text values
  d3.selectAll(".countryLabel").text("")

  // append a new text value with the updated values we want
  d3.selectAll(".countryLabel")
    .append("text")
    .attr("class", "countryName")
    .style("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 0)
    .text(function (d) {
      // get the tuple of the current state in d
      let s = getBEAZone(d.properties.name)
      let jobs = 0
      // some states dont populate in the sql query, in this case we ignore it
      if (s != null) {
        // otherwise we grab the count of jobs
        jobs = getCountForBEAZone(jsonFromServer, s)
      }
      // otherwise return the string State: int Jobs
      return s + ": " + jobs + " Jobs";
    })
    .call(getTextBox);

  // rescale the country label here
  d3.selectAll(".countryLabel")
    .insert("rect", "text")
    .attr("class", "countryLabelBg")
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("transform", function (d) {
      return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    })
    .attr("width", function (d) {
      return d.bbox.width + 4;
    })
    .attr("height", function (d) {
      return d.bbox.height;
    });


}

/**
 * This method is the main driver of the map creation
 * JSON Object jsonFromServer   - the current json data being returned by the server
 * @param {String} clickedState - the state that is clicked on
 */
function drawData(clickedState) {
  // maxJobs integer represents the state with the most jobs - will detirmine our color scaling ratio
  var maxJobs = getMaxJobs();

  d3.selectAll(".country").classed("country-on", false)
  // change the color of each state here
  d3.selectAll(".country").style("fill", function (d) {
    let s = getQueryState(d);
    // some states that have no job postings do not populate in the jsonFromServer (this should be fixe)
    if (s == null) {
      return "rgb(195,195,195)";
    }
    // assign a special color for the clicked-on state
    if (s.state === clickedState) {
      return clickedRGB
    }
    // otherwise scale the RGB and return it to be assigned to the states color
    return getScaledRGB(s, maxJobs);
  });

  // remove all the text values
  d3.selectAll(".countryLabel").text("")

  // append a new text value with the updated values we want
  d3.selectAll(".countryLabel")
    .append("text")
    .attr("class", "countryName")
    .style("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 0)
    .text(function (d) {
      // get the tuple of the current state in d
      let s = getQueryState(d)
      let jobs = 0
      // some states dont populate in the sql query, in this case we ignore it
      if (s != null) {
        // otherwise we grab the count of jobs
        jobs = s.count
      }
      // if the state is the one we clicked, we return a custom string
      if (s != null && s.state === clickedState) {
        return clickedState
      }
      // otherwise return the string State: int Jobs
      return d.properties.name + ": " + jobs + " Jobs";
    })
    .call(getTextBox);

  // rescale the country label here
  d3.selectAll(".countryLabel")
    .insert("rect", "text")
    .attr("class", "countryLabelBg")
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("transform", function (d) {
      return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    })
    .attr("width", function (d) {
      return d.bbox.width + 4;
    })
    .attr("height", function (d) {
      return d.bbox.height;
    });
}

/**
 * Sums the counts from the rows of the SQL query data sent from the server for a specific beazone. Note that this is
 * not total job counts, but the counts based on whatever inputs the user entered and are reflected by the query
 * @param {SQL Query Result} jsonFromServer query result from server
 * @param {String} s a beazone 
 * @return sum of counts in SQL return result 
 */
function getCountForBEAZone(jsonFromServer, s){
  for (var i = 0; i < jsonFromServer.length; i++){
    if (jsonFromServer[i].instbeazone === s){
      return jsonFromServer[i].count
    }
  }
  return 0
}