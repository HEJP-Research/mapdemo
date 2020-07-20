/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
*/

// DEFINE VARIABLES
// Define size of map group
// Full world map is 2:1 ratio

w = 1500;
h = 750;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;

// DEFINE FUNCTIONS/OBJECTS
// Define map projection
var projection = d3
  .geoAlbersUsa()
  // .geoEquirectangular()
  // .center([0, 15])
  // .scale([w/(2*Math.PI)])
  .translate([w / 2, h / 2]);
// Define map path
var path = d3.geoPath().projection(projection);
// Create function to apply zoom to countriesGroup
function zoomed() {
  t = d3.event.transform;
  countriesGroup.attr(
    "transform",
    "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
  );
}

// Define map zoom behaviour
var zoom = d3.zoom().on("zoom", zoomed);
function getTextBox(selection) {
  selection.each(function (d) {
    d.bbox = this.getBBox();
  });
}

// Function that calculates zoom/pan limits and sets zoom to default value
function initiateZoom() {
  // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
  minZoom = Math.max(
    $("#map-holder").width() / w,
    $("#map-holder").height() / h
  );
  // set max zoom to a suitable factor of this value
  maxZoom = 3 * minZoom;
  // set extent of zoom to chosen values
  // set translate extent so that panning can't cause map to move out of viewport
  zoom.scaleExtent([minZoom, maxZoom]).translateExtent([
    [0, 0],
    [w, h],
  ]);
  // define X and Y offset for centre of map to be shown in centre of holder
  midX = ($("#map-holder").width() - minZoom * w) / 2;
  midY = ($("#map-holder").height() - minZoom * h) / 2;
  // change zoom transform to min zoom and centre offsets
  svg.call(
    zoom.transform,
    d3.zoomIdentity.translate(midX, midY).scale(minZoom)
  );
}

// zoom to show a bounding box, with optional additional padding as percentage of box size
function boxZoom(box, centroid, paddingPerc) {
  minXY = box[0];
  maxXY = box[1];
  // find size of map area defined
  zoomWidth = Math.abs(minXY[0] - maxXY[0]);
  zoomHeight = Math.abs(minXY[1] - maxXY[1]);
  // find midpoint of map area defined
  zoomMidX = centroid[0];
  zoomMidY = centroid[1];
  // increase map area to include padding
  zoomWidth = zoomWidth * (1 + paddingPerc / 100);
  zoomHeight = zoomHeight * (1 + paddingPerc / 100);
  // find scale required for area to fill svg
  maxXscale = $("svg").width() / zoomWidth;
  maxYscale = $("svg").height() / zoomHeight;
  zoomScale = Math.min(maxXscale, maxYscale);
  // handle some edge cases
  // limit to max zoom (handles tiny countries)
  zoomScale = Math.min(zoomScale, maxZoom);
  // limit to min zoom (handles large countries and countries that span the date line)
  zoomScale = Math.max(zoomScale, minZoom);
  // Find screen pixel equivalent once scaled
  offsetX = zoomScale * zoomMidX;
  offsetY = zoomScale * zoomMidY;
  // Find offset to centre, making sure no gap at left or top of holder
  dleft = Math.min(0, $("svg").width() / 2 - offsetX);
  dtop = Math.min(0, $("svg").height() / 2 - offsetY);
  // Make sure no gap at bottom or right of holder
  dleft = Math.max($("svg").width() - w * zoomScale, dleft);
  dtop = Math.max($("svg").height() - h * zoomScale, dtop);
  // set zoom
  svg
    .transition()
    .duration(500)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
    );
}

// on window resize
$(window).resize(function () {
  // Resize SVG
  svg
    .attr("width", $("#map-holder").width())
    .attr("height", $("#map-holder").height());
  initiateZoom();
});


var selected = d3.set([
  9, 10, 12, 13, 17, 18, 19, 21, 23, 24,
  25, 26, 29, 31, 33, 34, 36, 37, 39, 42,
  44, 45, 47, 50, 51, 55
]);

// create an SVG
var svg = d3
  .select("#map-holder")
  .append("svg")
  // set to the same size as the "map-holder" div
  .attr("width", $("#map-holder").width())
  .attr("height", $("#map-holder").height())
  // add zoom functionality
  .call(zoom);
// get map data
d3.json(
  "https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson",
  //"state.geo.json",
  function (error, json) {
    //Bind data and create one path per GeoJSON feature
    countriesGroup = svg.append("g").attr("id", "map");
    
    svg.append("path")
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .attr("d", path(topojson.mesh(json, json.features, function (a, b) { return a !== b; })));
    
    // California-Nevada border
    svg.append("path")
      .attr("stroke", "cyan")
      .attr("stroke-width", 2.5)
      .attr("d", path(topojson.mesh(json, json.features, border("06", "32"))));
    
    // California-Arizona border
    svg.append("path")
      .attr("stroke", "magenta")
      .attr("stroke-width", 2.5)
      .attr("d", path(topojson.mesh(json, json.features, border("06", "04"))));

    // California-Oregon border
    svg.append("path")
      .attr("stroke", "yellow")
      .attr("stroke-width", 2.5)
      .attr("d", path(topojson.mesh(json, json.features, border("06", "41"))));

      // add a background rectangle
      countriesGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h);

      // draw a path for each feature/country
      countries = countriesGroup
        .selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("id", "countriesG")

        .attr("d", path)
        .attr("id", function (d) {
          return "country" + d.properties.postal;
        })
        .attr("class", "country")
        //      .attr("stroke-width", 10)
        //      .attr("stroke", "#ff0000")
        // add a mouseover action to show name label for feature/country
        .on("mouseover", function (d, i) {
          d3.select("#countryLabel" + d.properties.postal).style(
            "visibility",
            "visible"
          );
          //console.log(d.properties.name)
        })
        .on("mouseout", function (d, i) {
          d3.select("#countryLabel" + d.properties.postal).style(
            "visibility",
            "hidden"
          );
        })
        // add an onclick action to zoom into clicked country

        .on("click", function (d, i) {
          outOfStatePostingsGrayScale(d, i);
          //boxZoom(path.bounds(d), path.centroid(d), 20);
        });
      // Add a label group to each feature/country. This will contain the country name and a background rectangle
      // Use CSS to have class "countryLabel" initially hidden
      countryLabels = countriesGroup
        .selectAll("g")
        .data(json.features)
        .enter()
        .append("g")
        .attr("class", "countryLabel")
        .attr("id", function (d) {
          return "countryLabel" + d.properties.postal;
        })
        .attr("transform", function (d) {
          return (
            "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
          );
        })
        // add mouseover functionality to the label
        .on("mouseover", function (d, i) {
          d3.select(this).style("visibility", "visible");
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("visibility", "hidden");
        })
        // add an onlcick action to zoom into clicked country

        .on("click", function (d, i) {
          outOfStatePostingsGrayScale(d, i);
          //  boxZoom(path.bounds(d), path.centroid(d), 20);
        });

      function outOfStatePostingsGrayScale(d) {
        

        if (d.properties.name == lastState || !stateMode) {
          return;
        }

        lastState = d.properties.name;

        fetch("/mapModeState", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          // stringify an array containing the inputs from the HTML elements in addition to the state
          // that the user has clicked on
          body: JSON.stringify({
            year1: lastValidYear1,
            year2: lastValidYear2,
            div: lastDivision,
            ownership: lastOwnership,
            length: lastLength,
            isr1: lastIsR1,
            jobType: lastJobType,
            careerareas: Array.from(lastCareerAreas),
            clickedState: d.properties.name,
          }),
        })
          .then((response) => {
            return response.json();
          })

          .then((jsonFromServer) => {
            // console.log(jsonFromServer);
            serverData = jsonFromServer;
            drawData(d.properties.name);
            enableResetButton();
          });
      }

      year = svg.append("g").attr("id", "bigYear");
      year
        .append("text")
        .attr("x", 1500)
        .attr("y", 120)
        .text($("#myRange").val())
        .style("font-size", "6vw")
        .attr("alignment-baseline", "middle")
        .attr("value", "1976");

      infoTextGroup = svg
        .append("g")
        .attr("transform", "translate(0,120)")
        .attr("id", "infoTextGroup");

      initiateZoom();
    }
);

function border(id0, id1) {
  return function(a, b) {
    return a.id === id0 && b.id === id1
        || a.id === id1 && b.id === id0;
  };
}
