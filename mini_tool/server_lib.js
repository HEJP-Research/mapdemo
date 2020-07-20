/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 * 
 * This file contains a library of the helper functions utilized by server.js to generate SQL queries to
 * run on the postgres DB.
 */

// Place all functions to be used by server.js
// Any functions below this are helper functions to these functions
module.exports = {
  /**
   * Helper function that utilizes getSubjectIndicesInDiv() to generate the component
   * of the SQL query that identifies all jobs that are marked as having subjects
   * in the given division. The query will be of the form:
   *
   * "and (substring(subjs, 1, 1) = '1' OR substring(subjs, 2, 1) = '1') ... )"
   *
   * @param {String} div the division for which the query substring should be
   * generated
   * @return the SQL query substring pertaining to jobs in this division
   */
  getQueryForDiv: function(div) {
    // get the indices for the division using helper
    var divIndices = getSubjectIndicesInDiv(div);

    // if indices.length = 0, return "" (unrestricted)
    if (divIndices.length == 0) {
      return "";
    }

    // create SQL string starting with and (
    var out = " AND (";

    // for n-1 of n indices, append "OR" after substring(subjs, i, 1) = '1'
    for (var i = 0; i < divIndices.length - 1; i++) {
      out += "SUBSTRING(subjs, " + divIndices[i] + ", 1) = '1' OR ";
    }

    // don't add OR after the last one, just )
    out +=
      "SUBSTRING(subjs, " + divIndices[divIndices.length - 1] + ", 1) = '1'";
    return out + ")";
  },

  /**
   * Gets the queries for selection for data belonging to a collection of career areas.
   *
   * @param {String} careerarea the array of career areas for which the query substring should be
   * generated
   * @return the SQL query substring pertaining to jobs in these career areas
   *
   * NOTE: The list of longNames does not match the positions list we have.
   */
  getQueryForCareerArea: function(careerarea) {
    if (careerarea.length == 0) {
      return "";
    }

    var tupleStr = "(";
    for (v of careerarea) {
      tupleStr += "'" + v + "'" + ", ";
    }
    tupleStr = tupleStr.substring(0, tupleStr.length - 2) + ")";
    return "AND careerarea IN " + tupleStr;
  },

  /**
   * Gets the queries for selection for data belonging to a collection of beazones.
   *
   * @param {String} beazones the array of beazones for which the query substring should be
   * generated
   * @return the SQL query substring pertaining to jobs in these beazones
   */
  getQueryForBEAZones: function(beazones) {
    if (beazones.length == 0) {
      return "";
    }

    var tupleStr = "(";
    for (v of beazones) {
      tupleStr += "'" + v + "'" + ", ";
    }
    tupleStr = tupleStr.substring(0, tupleStr.length - 2) + ")";
    return "AND instbeazone IN " + tupleStr;
  },

  /**
   * This function returns the String to be added to a SQL query based on an
   * ownership String. That is, if ownership is 'public' then a SQL query string
   * is returned " AND public = '1'". If ownership = "unrestricted", empty string
   * is returned
   * @param {String} ownership the ownership indication
   * @return SQL substring to restrict query by ownership or ""
   */
  getOwnership: function(ownership) {
    if (ownership == "unrestricted") {
      return "";
    } else {
      return "AND " + ownership + " = '1'";
    }
  },

  /**
   * This function returns the String to be added to a SQL query based on an
   * length String. That is, if length is 'twoyear' then a SQL query string
   * is returned " AND twoyear = '1'". If length = "unrestricted", empty string
   * is returned
   * @param {String} length the length indication
   * @return SQL substring to restrict query by length or ""
   */
  getLength: function(length) {
    if (length == "unrestricted") {
      return "";
    } else {
      return "AND " + length + " = '1'";
    }
  },

  /**
   * This function returns the String to be added to a SQL query based on an
   * isr1 boolean.
   *
   * Note that the boolean
   * @param {boolean} isr1 indicating whether restricting to R1 institutions
   * @param {boolean} and indicating whether or not we need to append AND before the clause
   * @return SQL substring applying the restriction
   */
  getIsR1: function(isr1, and) {
    if (isr1) {
      return (and ? " AND " : "") + " isr1 = '1'";
    } else {
      return (and ? " AND " : "") + " (isr1 = '1' OR isr1 = '0') "; // Eitan Joseph is responsible for this monstrosity
    }
  },

  /**
   * This function returns the String to be added to a SQL query based on an
   * jobType String. That is, if jobType is 'fulltime' then a SQL query string
   * is returned " AND fulltime = '1'". If jobType = "unrestricted", empty string
   * is returned
   * @param {String} jobType the job type indication
   * @return SQL substring to restrict query by jobType or ""
   */
  getJobType: function(jobType) {
    if (jobType == "unrestricted") {
      return "";
    } else {
      return " AND " + jobType + " = '1'";
    }
  },
};

/**
 * Helper function that gets an array of indices of the subjects' location in the 43 character binary
 * string located in the SQL table for the subjects that are in this field division. For instance,
 * social sciences occupy indices 1 through 8 in the SQL table 43 character string. This function is
 * used by getQueryForDiv() to identify which substring characters in the SQL table attribute should
 * be '1' for a query on this division. If the division is 'unrestricted' an empty array is returned.
 *
 * @param {String} div a field division (e.g. social science, science, etc. or unrestricted)
 * @return the array of the indices in the division or an empty array if div = unrestricted
 */
function getSubjectIndicesInDiv(div) {
  var indices = new Array();

  // get indices for social science division
  if (div == "soc_sci") {
    for (var i = 1; i <= 8; i++) {
      indices.push(i);
    }
  }
  // get indices for science division
  else if (div == "sci") {
    for (var i = 9; i <= 14; i++) {
      indices.push(i);
    }
  }
  // get indices for humanities division
  else if (div == "hum") {
    for (var i = 29; i <= 32; i++) {
      indices.push(i);
    }
  }
  // for now, putting everything not categorized by their
  // "faculty exploration and addendum slides" into the other
  // division -> should probably make an "engineering" division
  // at some point
  else if (div == "other") {
    for (var i = 15; i <= 28; i++) {
      indices.push(i);
    }
    for (var i = 33; i <= 42; i++) {
      indices.push(i);
    }
  }
  return indices;
}
