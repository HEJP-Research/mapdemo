/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 * 
 * This file holds the JS functions that are used by index.html for hovering on links and cycling images.
 */

// This global variable tracks the currently displayed image. It starts at 8
// so that the first call to displayNextImage() will show image no. 0
// This variable is updated in cycling and when the user hovers ove ran image
var currDisplayID = 9;

// This global variable tracks the output of the setInterval() function. That way
// the interval can be "cleared" when the user hovers over a link
// By clearing the interval, we can stop the execution of the cycling of the images
var interval = null;

/*
This function is used when the user hovers over an image to display a given image.
This should not be confused with displaySampleImage() which is a helper method that
simply displays an image. This method will stop the cycling execution first so that
the example mode the user hovers over stays for as long as they hover over the slide.

@param imageID an image ID (1-3)
*/
function displayHoveredImage(imageID) {
  // Sets the description of the text area of mode description
  if (imageID == 1) {
    $("#mode_description").text(
      "In the bar graph mode, you can view the top 0 to 10 skills for the various input selections you make on areas such as year range, career area, institution type, and others."
    );
  } else if (imageID == 2) {
    $("#mode_description").text(
      "In the line graph mode, you can view job postings from 2007 to 2017 for the various input selections you make on areas such as year range, career area, institution type, and others. The selections you make will generate new graphs that appear alongside existing graphs."
    );
  } else {
    $("#mode_description").text(
      "In the map mode, you can view job postings by both state and beazone for the various input selections you make on areas such as year range, career area, institution type, and others."
    );
  }

  //Stop the image cyclin using the global variable interval
  clearInterval(interval);

  // Use the helper function to now display the selected image
  displaySampleImage(imageID);

  // Now let the user continue to previewing by re-enabling the button
  $("#previewBtnID").prop("disabled", false);
}

/*
 This is a helper function that simply displays the image with a given id from the sample images folder. 
 It is used by displayHoveredImage() and displayNextImage()

 @param imageID an image ID (1-9)
*/
function displaySampleImage(imageID) {
  // Update the image element's source and alternate text attributes using JQUery
  $("#sampleImageID").attr(
    "src",
    "sample_mode_images/sample_mode_image" + imageID + ".png"
  );

  // Sets the alternate text for the currently displayed image
  if (imageID % 3 == 0) {
    $("#sampleImageID").attr("alt", "Sample Image for Bar Graph Mode");
  } else if (imageID % 3 == 1) {
    $("#sampleImageID").attr("alt", "Sample Image for Line Graph Mode");
  } else {
    $("#sampleImageID").attr("alt", "Sample Image for Map Mode");
  }

  // Update the global variable currently displayed image ID.
  // This way, when image cycling starts again, we will start from where the user left off
  // If we didn't do this, cycling would continue from where the cycling stopped!
  currDisplayID = imageID;
}

/*
 This is a helper function that is used by loopSamples() that determines the next
 image to display and then uses displaySampleImage() to display it.
*/
function displayNextImage() {
  currDisplayID = ((currDisplayID + 1) % 9) + 1;

  // Determined next image to display, so we display it
  displaySampleImage(currDisplayID);
}

/*
 This function loops over the sample images using the built in setInterval() method along
 with the helper function displayNextImage(). Images are cycled every 3 seconds.
*/
function loopSamples() {
  $("#mode_description").text(
    "Hover over a mode to see a description of the mode."
  );
  $("#previewBtnID").prop("disabled", true);
  interval = setInterval(displayNextImage, 3000);
}
