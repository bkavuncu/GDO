/**
 * Schema specifications for the Hercules Data Exchange.
 *
 * Docs for js-schema:
 *  https://github.com/molnarg/js-schema
 * */
var schema = require('js-schema');

export var types = schema(['Text', 'Integral', 'Floating', 'DateTime', 'URL', 'GPSCoords', 'Boolean', 'Unknown']);

var stats = schema({
    min: Number,
    max: Number,
    median: Number,
    mean: Number,
    isEnum: Boolean,
    variance: Number,
    stdDev: Number,
    sum: Number,
    count: Number
});

export var validField = schema({
    name: String,
    description: [null, String],
    type: types,
    origin: ['native', 'artificial'],
    disabled: Boolean,
    stats: [stats, null],
    index: Number
});

export var validMiniset = schema({
    name: String,
    description: String,
    length: Number.above(0),
    sourceType: String,
    sourceOrigin: String,
    disabled: Boolean,
    fields: Array.of(validField),
    _id: String
});


export var validDataset = schema({
    schema: validMiniset,
    rows: Array.of(Array)
});
