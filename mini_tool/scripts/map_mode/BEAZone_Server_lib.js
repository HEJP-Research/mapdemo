/**
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 */
module.exports = {
    getBEAZone_Server: function(state){
        var beazones = {
            'Connecticut': 'New England',
            'Maine': 'New England',
            'Massachusetts': 'New England',
            'New Hampshire': 'New England',
            'Rhode Island': 'New England',
            'Vermont': 'New England',
            'Delaware': 'Mideast',
            'District of Columbia': 'Mideast',
            'Maryland': 'Mideast',
            'New Jersey': 'Mideast',
            'New York': 'Mideast',
            'Pennsylvania': 'Mideast',
            'Illinois': 'Great Lakes',
            'Indiana': 'Great Lakes',
            'Michigan': 'Great Lakes',
            'Ohio': 'Great Lakes',
            'Wisconsin': 'Great Lakes',
            'Iowa': 'Plains',
            'Kansas': 'Plains',
            'Minnesota': 'Plains',
            'Missouri': 'Plains',
            'Nebraska': 'Plains',
            'North Dakota': 'Plains',
            'South Dakota': 'Plains',
            'Alabama': 'Southeast',
            'Arkansas': 'Southeast',
            'Florida': 'Southeast',
            'Georgia': 'Southeast',
            'Kentucky': 'Southeast',
            'Louisiana': 'Southeast',
            'Mississippi': 'Southeast',
            'North Carolina': 'Southeast',
            'South Carolina': 'Southeast',
            'Tennessee': 'Southeast',
            'Virginia': 'Southeast',
            'West Virginia': 'Southeast',
            'Arizona': 'Southwest',
            'New Mexico': 'Southwest',
            'Oklahoma': 'Southwest',
            'Texas': 'Southwest',
            'Colorado': 'Rocky Mountain',
            'Idaho': 'Rocky Mountain',
            'Montana': 'Rocky Mountain',
            'Utah': 'Rocky Mountain',
            'Wyoming': 'Rocky Mountain',
            'Alaska': 'Far West',
            'California': 'Far West',
            'Hawaii': 'Far West',
            'Nevada': 'Far West',
            'Oregon': 'Far West',
            'Washington': 'Far West'
            }
            return beazones[state];
    }
}
