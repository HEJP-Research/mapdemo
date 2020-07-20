/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 * 
 * This file runs the back-end server and has the primary purpose of handling POST requests from the client
 * webpage and querying the postgres DB on turing.
 */

// get the exported functions from the library
const lib = require("./server_lib");
const BEAZone_lib = require("./scripts/map_mode/BEAZone_Server_lib.js");

// set up the postgres client, express
var express = require("express");
const { Client } = require("pg");

// The client will be used to query the hejp postgres DB on turing using an environmental variable USERFLAG we can
// run the program with the credentials of chami, ruth, or eitan
client = new Client({
  host: "/var/run/postgresql",
  user: process.env.USERFLAG,
  password: "",
  database: "hejp",
});

// attempt to connect to server
client.connect((err) => {
  if (err) {
    console.error("connection error to PSQL DB", err.stack);
  } else {
    console.log("connected to PSQL DB");
  }
});

// Initialize express app
var app = express();

// This will be used to parse the request body sent by the client to the server into a JSON array
// N.B. the body parser is a separate NPM package that was installed
var bodyParser = require("body-parser");

// support json encoded bodies
app.use(bodyParser.json());

// Allows us to use scripts, views and organized for each visualization
// views holds the ejs files for each visualization
// scripts associated with the ejs files files for each visualization
app.use(express.static(__dirname + "/"));

// Marks that we will be using ejs templating
app.set("view engine", "ejs");

/**
 * When the client posts a request on the resource "mapsModeData", run the function below given parameters
 * req (contains request's/client data) and res (response to send back to the client).
 */
app.post("/mapsModeData", function(req, res) {
  // get the HTML elements' inputs on client-side via POST request body
  var year1 = req.body.year1; // year 1 (lower year) from client
  var year2 = req.body.year2; // year 2 (upper year) from client
  var div = req.body.div; // division (social science, science)
  var ownership = req.body.ownership; // ownership (public, private)
  var length = req.body.length; // length (2 year v. 4 year)
  var isr1 = req.body.isr1; // research type (R1 or not)
  var jobType = req.body.jobType; // job type (full time, part time)
  var careerareas = req.body.careerareas; // career areas (engineering, planning and analysis, etc.)

  // Check if you are viewing in map mode or in state mode
  var stateMode = req.body.stateMode;

  // If you are in beazone mode
  if (!stateMode) {
    client
      .query(
        "SELECT instbeazone, count(*) FROM post_doc_jobs WHERE " +
          "year BETWEEN " +
          year1 +
          " AND " +
          year2 +
          lib.getQueryForDiv(div) +
          lib.getQueryForCareerArea(careerareas) +
          lib.getOwnership(ownership) +
          lib.getIsR1(isr1, true) +
          lib.getLength(length) +
          lib.getJobType(jobType) +
          " GROUP BY instbeazone"
      )
      .then((data) => {
        res.json(data.rows);
      })
      .catch((e) => console.error(e.stack));
  }

  // If you are in state mode
  else {
    client
      .query(
        "SELECT inststate AS state, count(*) FROM post_doc_jobs WHERE year BETWEEN " +
          year1 +
          " AND " +
          year2 +
          lib.getQueryForDiv(div) +
          lib.getQueryForCareerArea(careerareas) +
          lib.getOwnership(ownership) +
          lib.getIsR1(isr1, true) +
          lib.getLength(length) +
          lib.getJobType(jobType) +
          " GROUP BY inststate;"
      )
      .then((data) => {
        res.json(data.rows);
      })
      .catch((e) => console.error(e.stack));
  }
});

/**
 * When the client posts a request on the resource "mapModeState", run the function below given parameters
 * req (contains request's/client data) and res (response to send back to the client).
 */
app.post("/mapModeState", function(req, res) {
  // get the HTML elements' inputs on client-side via POST request body
  var year1 = req.body.year1; // year 1 (lower year) from client
  var year2 = req.body.year2; // year 2 (upper year) from client
  var div = req.body.div; // division (social science, science)
  var ownership = req.body.ownership; // ownership (public, private)
  var length = req.body.length; // length (2 year v. 4 year)
  var isr1 = req.body.isr1; // research type (R1 or not)
  var jobType = req.body.jobType; // job type (full time, part time)
  var careerareas = req.body.careerareas; // career areas (engineering, planning and analysis, etc.)

  // Also, get the state that was clicked that is what triggers the post request to this resource
  var clickedState = req.body.clickedState;

  // Build query using client inputs and helper functions in lib
  // Have to make sure that WHERE actually has something to select on
  client
    .query(
      "SELECT state, CASE WHEN inststate LIKE state THEN 0 ELSE count(jobid) END FROM post_doc_jobs WHERE inststate like '" +
        clickedState +
        "' AND year BETWEEN " +
        year1 +
        " AND " +
        year2 +
        lib.getQueryForDiv(div) +
        lib.getQueryForCareerArea(careerareas) +
        lib.getOwnership(ownership) +
        lib.getIsR1(isr1, true) +
        lib.getLength(length) +
        lib.getJobType(jobType) +
        " GROUP BY inststate, state"
    )
    .then((data) => {
      res.json(data.rows);
    })
    .catch((e) => console.error(e.stack));
});

/**
 * When the client posts a request on the resource "barModeData", run the function below given parameters
 * req (contains request's/client data) and res (response to send back to the client).
 */
app.post("/barModeData", function(req, res) {
  // get the HTML elements' inputs on client-side via POST request body
  var year1 = req.body.year1; // year 1 (lower year) from client
  var year2 = req.body.year2; // year 2 (upper year) from client
  var div = req.body.div; // division (social science, science)
  var ownership = req.body.ownership; // ownership (public, private)
  var length = req.body.length; // length (2 year v. 4 year)
  var isr1 = req.body.isr1; // research type (R1 or not)
  var jobType = req.body.jobType; // job type (full time, part time)
  var careerareas = req.body.careerareas; // career areas (engineering, planning and analysis, etc.)
  var beazones = req.body.beazones; // beazones (New England, Great Lakes, etc.)

  // Build query using client inputs and helper functions in lib
  client
    .query(
      "SELECT skillname, COUNT(skillname) FROM post_doc_skills WHERE jobid IN (SELECT jobid FROM post_doc_jobs WHERE year BETWEEN " +
        year1 +
        " AND " +
        year2 +
        lib.getIsR1(isr1, true) +
        lib.getQueryForDiv(div) +
        lib.getQueryForCareerArea(careerareas) +
        lib.getQueryForBEAZones(beazones) +
        lib.getOwnership(ownership) +
        lib.getLength(length) +
        lib.getJobType(jobType) +
        ") GROUP BY skillname ORDER BY COUNT(skillname) DESC LIMIT 10;"
    )
    .then((data) => {
      res.json(data.rows);
    })
    .catch((e) => console.error(e.stack));
});

/**
 * When the client posts a request on the resource "lineModeData", run the function below given parameters
 * req (contains request's/client data) and res (response to send back to the client).
 */
app.post("/lineModeData", function(req, res) {
  // get the HTML elements' inputs on client-side via POST request
  var div = req.body.div; // division (science, social science, etc.)
  var ownership = req.body.ownership; // ownership (public, private)
  var length = req.body.length; // length (2 year v. 4 year)
  var isr1 = req.body.isr1; // research (R1 or not)
  var jobType = req.body.jobType; //  job type (full time, part time)
  var careerareas = req.body.careerareas; // career areas (engineering, planning and analysis, etc.)
  var beazones = req.body.beazones; // beazones (New England, Great Lakes, etc.)

  // Build query using client inputs and helper functions in lib
  // Have to make sure that WHERE actually has something to select on
  client
    .query(
      "SELECT d.year, SUM(d.count) as count FROM ((SELECT year, count(*) as count FROM post_doc_jobs WHERE " +
        lib.getIsR1(isr1, false) +
        lib.getQueryForDiv(div) +
        lib.getQueryForCareerArea(careerareas) +
        lib.getQueryForBEAZones(beazones) +
        lib.getOwnership(ownership) +
        lib.getLength(length) +
        lib.getJobType(jobType) +
        "GROUP BY year) UNION (SELECT year, 0 as count FROM post_doc_jobs)) as d GROUP BY d.year ORDER BY d.year;"
    )
    .then((data) => {
      res.json(data.rows);
    })
    .catch((e) => console.error(e.stack));
});

// For the resource map_mode, render it at map_mode/map_mode.ejs
app.get("/map_mode", function(req, res) {
  res.render("map_mode/map_mode");
});

// For the resource bar_mode, render it at bar_mode/bar_mode.ejs
app.get("/bar_mode", function(req, res) {
  res.render("bar_mode/bar_mode");
});

// For the resource line_mode, render it at line_mode/line_mode.ejs
app.get("/line_mode", function(req, res) {
  res.render("line_mode/line_mode");
});

app.listen(7000);
