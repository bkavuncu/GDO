/**
 * Schema specifications for the Hercules Data Exchange.
 *
 * Docs for js-schema:
 *  https://github.com/molnarg/js-schema
 * */
var schema = require('js-schema');

export var validField = schema({
    name: String,
    description: [null, String],
    type: ['String', 'Integer', 'Float', 'Datetime', 'URL', 'Enum', 'Boolean'],
    origin: ['native', 'artificial'],
    disabled: Boolean
});

export var validMiniset = schema({
    name: String,
    description: String,
    id: Number.above(0),
    length: Number.above(0),
    source: [{
        type: 'URL',
        url: String
    },{
        type: 'FILE',
        path: String
    }],
    disabled: Boolean,
    fields: Array.of(validField)
});


export var validDataset = schema({
    schema: validMiniset,
    rows: Array.of(Array)
});
