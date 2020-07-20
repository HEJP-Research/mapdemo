/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 * 
 * This file contains functions for reading data from the client interaction HTML elements on views/map_mode.ejs 
 * 
 * The file has separate functions for each HTML element which updates a global variable that can then be accessed 
 * from map_mode.js' updateMap() function. 
*/

// this tracks the last valid year 1 slider input
var lastValidYear1 = 2007;

// this tracks the last valid year 2 slider input
var lastValidYear2 = 2017;

// this tracks the last division (science, social science, etc.) that was input
var lastDivision = "unrestricted";

// this tracks the last ownership type (i.e. public v private)
var lastOwnership = "unrestricted";

// this tracks the last length type (i.e. 2 year v 4 year)
var lastLength = "unrestricted";

// this tracks whether the R1 box was checked or not
var lastIsR1 = false;

// this tracks the last job type (i.e. fulltime, parttime, etc.)
var lastJobType = "unrestricted";

// this tracks the last career areas that were checked
var lastCareerAreas = new Set();

// this tracks the last BEA zones that were checked
var lastBEAZones = new Set();

// this is the current year that has been input on first slider
var currYear1 = 2007;

// this is the current year that has been
var currYear2 = 2017;

// this tracks the current division (science, social science, etc.)
var currDivision = "unrestricted";

// this tracks the current ownership type (i.e. public v private)
var currOwnership = "unrestricted";

// this tracks the current length type (i.e. 2 year v 4 year)
var currLength = "unrestricted";

// this tracks whether the R1 box is checked or not
var currIsR1 = false;

// this tracks which elements have been checked currently
var currCareerAreas = new Set();

// this tracks the current job type
var currJobType = "unrestricted";

// this tracks which BEA zones have been checked currently
var currBEAZones = new Set();

/*
This function is run when either a slider is changed. This will update the
lastValidYear1, lastValidYear2 global variables. 
*/
function updateYears() {
  // get the years from the range sliders
  var year1 = $("#year1Slider").val();
  var year2 = $("#year2Slider").val();

  // No data for years 2008, 2009
  // can't be comparing the same year
  if (
    year1 > year2 ||
    year1 == 2008 ||
    year1 == 2009 ||
    year2 == 2008 ||
    year2 == 2009
  ) {
    // Update the sliders to be at the last valid year entries and then return
    // don't want to do any querying for invalid data inputs
    $("#year1Slider").val(currYear1);
    $("#year2Slider").val(currYear2);
  }
  // if user just keeps clicking on the same start and end years, don't want to keep re-running the queries..
  else if (year1 != lastValidYear1 || year2 != lastValidYear2) {
    currYear1 = year1;
    currYear2 = year2;
    $("#year1Label").text(currYear1);
    $("#year2Label").text(currYear2);
  }
}

// This function updates the current division selected from the dropdown
function updateDivisionSelection() {
  currDivision = $("#division_select_id").val();
}

// This function updates the global variable tracking institution ownership
function updateInstitutionOwnership() {
  currOwnership = $("#inst_ownership").val();
}

// this function updates the global variable tracking institution length
function updateInstitutionLength() {
  currLength = $("#inst_length").val();
}

// this function updates the current job type that was selected
function updateJobType() {
  currJobType = $("#jobTypeSelect").val();
}

// this function updates the isR1 global variable
function updateIsR1() {
  currIsR1 = $("#isr1_checkbox").is(":checked");
}

/*
  Tracks that a specific checkbox has been updated. If the checkbox is now checked, then
  its associated label is added to the set of currently selected subjects. If the checkbox
  is now unchecked, then its associated label is removed from the set of currently selected
  subjects. 

  @param i this is the index of the checkbox (1-25) from the page 
*/
function updateCheckBox(i) {
 // JQuery method of retrieving label text
 var labelText = $("#label" + i).text();
 if (i < 26) {
   // JQuery method of checking if checkbox is checked
   if ($("#checkbox" + i).is(":checked")) {
     currCareerAreas.add(labelText);
   } else {
     currCareerAreas.delete(labelText);
   }
 }
 else {
   // JQuery method of checking if checkbox is checked
   if ($("#checkbox" + i).is(":checked")) {
     currBEAZones.add(labelText);
   } else {
     currBEAZones.delete(labelText);
   }
 }
}

/**
 * Updates whether or not you are viewing the map and its data as states or as beazones based on the value of
 * the associated dropdown in the EJS file.
 */
function updateLocationView() {
  if ($("#display_modes").val()=="beazone") {
    stateMode = false
  }
  else {
    stateMode = true
  }
  updateMap(true)
}

/**
 * Tracks that the same checkboxes were checked before the "GO" button is clicked.
 * All this does is a set comparison between the sets "currSubjs" and "lastSubjs".
 *
 * @return true if a checkbox was checked/unchecked or a new checkbox was checked
 * and false if checkboxes all remained in the same state
 */
function sameChecked() {
  // sets different size => sets different
  if (currCareerAreas.size != lastCareerAreas.size) {
    return false;
  }

  // for each value in currSubjs, check if its in lastSubjs
  for (v of currCareerAreas.values()) {
    // if its not there, then currSubjs must have some other
    // element => return false
    if (!lastCareerAreas.has(v)) {
      return false;
    }
  }

  // lastSubjs has each element in currSubjs and no other elements
  return true;
}


/**
 * This function determines if the same beazones have been checked since the last query was run on the server
 * @return true if all the same beazones were checked, else false
 */
function sameBEAZonesChecked() {
  // sets different size => sets different
  if (currBEAZones.size != lastBEAZones.size) {
    return false;
  }

  // for each value in currSubjs, check if its in lastSubjs
  for (v of currBEAZones.values()) {
    // if its not there, then currSubjs must have some other
    // element => return false
    if (!lastBEAZones.has(v)) {
      return false;
    }
  }

  // lastSubjs has each element in currSubjs and no other elements
  return true;
}

/**
 * This function resets the map to display the job counts for each state when the user wants
 * to switch back from looking at out of state job postings for a given state.
 */
function resetMap() {
  // reset server data
  serverData = oldServerData;

  // draw the data (no need to re-query)
  drawData(-1);

  // disable reset button
  disableResetButton();

  lastState = null;
}

/**
 * Disables the reset map button to be clicked and
 * turns it white. This should be called after jobs
 * data is pulled from the map in updateMap() in
 * jobsMode.js and after the map is reset in resetMap().
 */
function disableResetButton() {
  $("#reset").prop("disabled", true);
  $("#reset").css("background-color", "white");
}

/**
 * Enables the reset map button to be clicked and turns
 * it red. This should be called after a state is clicked
 * on in map.js.
 */
function enableResetButton() {
  $("#reset").prop("disabled", false);
  $("#reset").css("background-color", "red");
}

/**
 * This method determines if jobsMode.js should send the server a POST request for a new
 * SQL query to be run.
 *
 * @return true if at least one HTML attribute is changed and false if none are changed
 */
function shouldRunNewQuery() {
  if (
    // if year1 / year 2 (sliders) were changed
    currYear1 != lastValidYear1 ||
    currYear2 != lastValidYear2 ||
    // if division / inst type (dropdowns, checkboxes) were changed
    currDivision != lastDivision ||
    currOwnership != lastOwnership ||
    currLength != lastLength ||
    currIsR1 != lastIsR1 ||
    currJobType != lastJobType ||
    // if checkboxes changed state
    !sameChecked() ||
    !sameBEAZonesChecked()
  ) {
    // if something was changed, update "last" versions of the attributes
    lastValidYear1 = currYear1;
    lastValidYear2 = currYear2;
    lastDivision = currDivision;
    lastOwnership = currOwnership;
    lastLength = currLength;
    lastIsR1 = currIsR1;
    lastJobType = currJobType;
    // we cannot simply set lastSubjs = currSubjs here because then they point
    // to the same set
    lastCareerAreas.clear();
    currCareerAreas.forEach((careerarea) => lastCareerAreas.add(careerarea));
    lastBEAZones.clear();
    currBEAZones.forEach((beazone) => lastBEAZones.add(beazone));
    return true;
  }
  // no change, no need to update "last" versions
  return false;
}

/**
 * This function is used to view the fake selection dropdown div when the user clicks on the button "career areas".
 * @param {String} id id of div 
 */
function viewDiv(id) {
  var x = document.getElementById(id);
  x.style.display = "block";
}

/**
 * This function is used to hide the fake selection dropdown div when the user mouses out of all the career areas 
 * checkboxes.
 * @param {String} id id of div
 */
function hideDiv(id) {
  var x = document.getElementById(id);
  x.style.display = "none";

}

