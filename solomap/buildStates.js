/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 */

var states = [];
var stateAbbreviations = [];
var numStates = 0;
var numYears = 0;
var states1 = [];

var saveData = (function () {
    var a = document.createElement("a");
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data, undefined, 2),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function buildStates(data) {
    for(var i = 0; i<data.length; i++)
    {
        if(states[data[i]['state_po']] === undefined || states[data[i]['state-po']] === null) {
            states[data[i]['state_po']] = {
                name: data[i]['state'],
                abbrev: data[i]['state_po'],
                years: []
            }
            stateAbbreviations.push(data[i]['state_po']);
            numStates++;
        }
        if(states[data[i]['state_po']].years[(data[i]['year'])/4-494] === undefined ||
            states[data[i]['state_po']].years[(data[i]['year'])/4-494] === null) {
            states[data[i]['state_po']].years[(data[i]['year'])/4-494] = {
                year: data[i]['year'],
                totalVotes: data[i]['totalvotes'],
                votes: [],
                parties: [],
            };
        }
        var vote = {
            party: data[i]['party'],
            candidate: data[i]['candidate'],
            votes: data[i]['candidatevotes']
        }
        if(states[data[i]['state_po']].years[(data[i]['year'])/4-494].votes[data[i]['party']] === undefined ||
            states[data[i]['state_po']].years[(data[i]['year'])/4-494].votes[data[i]['party']] === null) {
            states[data[i]['state_po']].years[(data[i]['year'])/4-494].votes.push(vote);
            states[data[i]['state_po']].years[(data[i]['year'])/4-494].parties.push(data[i]['party']);
        }
    }
    states1 = [];
    for(var i = 0; i < stateAbbreviations.length; i++) {
        states1.push(states[stateAbbreviations[i]])
    }
    fileName = "states1.json";    
    saveData(states1, fileName);
    console.log("file saved");
}