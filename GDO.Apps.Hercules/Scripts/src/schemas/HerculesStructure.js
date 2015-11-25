const schema = require('js-schema');

const types = require('./DatasetStructure').types,
    graphTypes = require('./GraphStructure').graphTypes;


const dimension = schema({
    name: String,
    fields: Array.of(string)
});

const graph = schema({
    graphType: graphTypes,
    dimensions: [null, Array.of(dimension)]
});

const section = schema({
    id: Number,
    nodeList: Array.of(Number),
    deployed: [null, graph]
});


const filterType = schema([
    {
        type: 'NUMERIC_FILTER',
        min: [null, Number],
        max: [null, Number]
    },{
        type: 'ENUM_FILTER',
        selectedValues: Array
    }
]);

const filter = schema({
    field: String,
    filter: filterType
});

export const hercules = schema({
    datasetId: [null, Number.min(0).step(1)],
    sections: [null, Array.of(section)],
    filter: [null, Array.of(filter)]
});
