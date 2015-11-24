/**
 * Schema specifications for the Hercules Graphs.
 *
 * Docs for js-schema:
 *  https://github.com/molnarg/js-schema
 * */
var schema = require('js-schema');
var validDataset = require('Dataset').validDataset

export var lineGraph = schema({
    type: 'LINE',
    xAxis: ['Float', 'Integer', 'Datetime'],
    yAxis: [['Float', 'Integer']]
});

export var scatterGraph = schema({
    type: 'SCATTER',
    xAxis: ['Float', 'Integer', 'Datetime'],
    yAxis: [['Float', 'Integer']]
});

export var barGraph = schema({
    type: 'BAR',
    xAxis: ['Integer', 'Enum'],
    yAxis: ['Float', 'Integer']
});

export var pieGraph = schema({
    type: 'PIE',
    xAxis: ['Enum'],
    yAxis: ['Float', 'Integer']
});

export var validGraphData = schema([
    lineGraph, scatterGraph,
    barGraph, pieGraph
]);

