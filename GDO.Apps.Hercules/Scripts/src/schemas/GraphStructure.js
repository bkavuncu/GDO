/**
 * Schema specifications for the Hercules Graphs.
 *
 * Docs for js-schema:
 *  https://github.com/molnarg/js-schema
 * */
var schema = require('js-schema');

export var type = schema(['Text', 'Integral', 'Floating', 'DateTime', 'URL', 'GPSCoords', 'Boolean', 'Unknown']);

export const graphTypes = schema(['LINE', 'SCATTER', 'BAR', 'PIE']);

var dimension = schema({
    name: String,
    singleField: Boolean,
    validTypes: Array.of(type)
});

var graph = schema({
    graphType: String,
    dimensions: Array.of(dimension)
});

export var lineGraph = {
    graphType: 'LINE',
    dimensions : [
        {
            name: 'xAxis',
            singleField: true,
            validTypes: ['Floating', 'Integral', 'DateTime']
        },{
            name: 'yAxis',
            singleField: false,
            validTypes: ['Floating', 'Integral']
        }
    ]
};

export var scatterGraph = {
    graphType: 'SCATTER',
    dimensions : [
        {
            name: 'x',
            singleField: true,
            validTypes: ['Floating', 'Integral', 'DateTime']
        },{
            name: 'y',
            singleField: false,
            validTypes: ['Floating', 'Integral']
        }
    ]
};

export var barGraph = {
    graphType: 'BAR',
    dimensions : [
        {
            name: 'x',
            singleField: true,
            validTypes: ['Integer']
        },{
            name: 'y',
            singleField: false,
            validTypes: ['Floating', 'Integral']
        }
    ]
};

export var pieGraph = {
    graphType: 'PIE',
    dimensions : [
        {
            name: 'x',
            singleField: true,
            validTypes: []
        },{
            name: 'y',
            singleField: true,
            validTypes: ['Floating', 'Integral']
        }
    ]
};

export var table = {
    graphType: 'TABLE',
    dimensions: [{
        name: 'Columns',
        singleField: false,
        validTypes: ['Floating', 'Integral', 'DateTime', 'Boolean']
    }]
}

export var validGraphData = schema([
    lineGraph, scatterGraph,
    barGraph, pieGraph
]);

export var sectionGraph = schema({
    sectionId: Number,
    graphData: validGraphData
});
