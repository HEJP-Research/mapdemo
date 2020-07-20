/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 */

$.getJSON('states.json', function (data) {
    states = data;
}).then(function () {
    processCurrentYear();
});

// collects clicked state name
function updateStateColors(state, scalingFactors){
    var scalingFactor = scalingFactors.get(state.properties.name)*255;
    return "rgb("+scalingFactor+", "+scalingFactor+", "+scalingFactor+")"
    //console.log(state.properties.name);
   // return calculateScalingFactor(state.properties.name);
}



function calculateScalingFactor(state){
    state = captureState(state);
    updateBigName(state)
    
    var scalingMap = new Map()
    let stateYrMaxes = new Array()
    for (let i = 0; i < state.years.length; i++) {
        stateYrMaxes.push(state.years[i].votes[0].party)
    }
    
    for(var i = 0; i < states.length; i++) {

        let count = 0
        for (var j = 0; j < states[i].years.length; j++){
            count += (states[i].years[j].votes[0].party === stateYrMaxes[j])
        }

        let fac = count/11
        scalingMap.set(states[i].name, fac)
    }

    return scalingMap;

}

function captureState(state){
    for (let i = 0; i < states.length; i++){
        if (states[i].name === state.properties.name){
            return states[i];
        }
    }

    return null;
}

function updateBigName(state){
    d3.select("#bigYear").select("text").attr("value", state.name)
    d3.select("#bigYear").select("text").text(d3.select("#bigYear").select("text").attr("value"))
    var x = (1500 - 50*((d3.select("#bigYear").select("text").attr("value").length) - 4))
    var y = getWidthOfText(state.name, "Arial", "4.2vw")
    console.log(y)
    d3.select("#bigYear").select("text").attr("x", 1800 - y).attr("y", "90")
    d3.select("#bigYear").select("text").style("font-size", "4.2vw")
    
}

function getWidthOfText(txt, fontname, fontsize){
    if(getWidthOfText.c === undefined){
        getWidthOfText.c=document.createElement('canvas');
        getWidthOfText.ctx=getWidthOfText.c.getContext('2d');
    }
    getWidthOfText.ctx.font = fontsize + ' ' + fontname;
    return getWidthOfText.ctx.measureText(txt).width;
}