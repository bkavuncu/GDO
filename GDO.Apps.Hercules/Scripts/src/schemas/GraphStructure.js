/**
 * Schema specifications for the Hercules Graphs.
 *
 * Docs for js-schema:
 *  https://github.com/molnarg/js-schema
 * */
var schema = require('js-schema');

export var type = schema(['Float', 'Integer', 'Datetime', 'Enum', 'Bool']);

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
            validTypes: ['Float', 'Integer', 'Datetime']
        },{
            name: 'yAxis',
            singleField: false,
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var scatterGraph = {
    graphType: 'SCATTER',
    dimensions : [
        {
            name: 'xAxis',
            singleField: true,
            validTypes: ['Float', 'Integer', 'Datetime']
        },{
            name: 'yAxis',
            singleField: false,
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var barGraph = {
    graphType: 'BAR',
    dimensions : [
        {
            name: 'xAxis',
            singleField: true,
            validTypes: ['Enum', 'Integer']
        },{
            name: 'yAxis',
            singleField: false,
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var pieGraph = {
    graphType: 'PIE',
    dimensions : [
        {
            name: 'xAxis',
            singleField: true,
            validTypes: ['Enum']
        },{
            name: 'yAxis',
            singleField: true,
            validTypes: ['Float', 'Integer']
        }
    ]
};

export var table = {
    graphType: 'TABLE',
    dimensions: [{
        name: 'Columns',
        singleField: false,
        validTypes: ['Float', 'Integer', 'Datetime', 'Enum', 'Boolean']
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
