/**
 * Schema specifications for the Hercules Graphs.
 *
 * Docs for js-schema:
 *  https://github.com/molnarg/js-schema
 * */
var schema = require('js-schema');
var validDataset = require('./Dataset').validDataset;


var type = schema(['Float', 'Integer', 'Datetime', 'Enum', 'Float']);

var dimension = schema({
    name: String,
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
            validTypes: ['Float', 'Integer', 'Datetime']
        },{
            name: 'yAxis',
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var scatterGraph = {
    graphType: 'SCATTER',
    dimensions : [
        {
            name: 'xAxis',
            validTypes: ['Float', 'Integer', 'Datetime']
        },{
            name: 'yAxis',
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var barGraph = {
    graphType: 'BAR',
    dimensions : [
        {
            name: 'xAxis',
            validTypes: ['Enum', 'Integer']
        },{
            name: 'yAxis',
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var pieGraph = {
    graphType: 'PIE',
    dimensions : [
        {
            name: 'xAxis',
            validTypes: ['Enum']
        },{
            name: 'yAxis',
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var validGraphData = schema([
    lineGraph, scatterGraph,
    barGraph, pieGraph
]);

export var sectionGraph = schema({
    sectionId: Number,
    graphData: validGraphData
});
