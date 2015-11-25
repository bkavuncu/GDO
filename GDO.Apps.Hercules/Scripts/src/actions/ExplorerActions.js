const Dispatcher = require('../Dispatcher'),
    schemas = require('../schemas/DatasetStructure');

var datasets = [
    {
        id: 1,
        name: 'George Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Boolean'
            },{
                name: 'orange',
                description: 'whatever',
                disabled: false,
                origin: 'artificial',
                type: 'Float'
            },{
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Boolean'
            },{
                name: 'orange',
                description: 'whatever',
                disabled: false,
                origin: 'artificial',
                type: 'Float'
            },{
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Boolean'
            },{
                name: 'orange',
                description: 'whatever',
                disabled: false,
                origin: 'artificial',
                type: 'Float'
            }
        ],
        disabled: false,
        length: 500,
        source: {
            type: 'URL',
            url: 'http://deez.nuts/data.csv'
        }
    },{
        id: 2,
        name: 'Sam Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            }
        ],
        disabled: false,
        length: 500,
        source: {
            type: 'URL',
            url: 'http://deez.nuts/data.csv'
        }
    }, {
        id: 3,
        name: 'Gina Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            }
        ],
        disabled: false,
        length: 500,
        source: {
            type: 'URL',
            url: 'http://deez.nuts/data.csv'
        }
    },{
        id: 4,
        name: 'Jeremiah Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            }
        ],
        disabled: false,
        length: 500,
        source: {
            type: 'URL',
            url: 'http://deez.nuts/data.csv'
        }
    },{
        id: 5,
        name: 'Jermaine Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            }
        ],
        disabled: false,
        length: 500,
        source: {
            type: 'URL',
            url: 'http://deez.nuts/data.csv'
        }
    }, {
        id: 6,
        name: 'Geoffrey Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            }
        ],
        disabled: false,
        length: 500,
        source: {
            type: 'URL',
            url: 'http://deez.nuts/data.csv'
        }
    }
];

export function requestMinisets () {
    datasets.map ((d) => {
        var valid = schemas.validMiniset;

        if (valid(d)) {
            console.log('Una bomba');
        } else {
            console.error(valid.errors(d))
        }
        Dispatcher.dispatch({
            actionType: 'addMiniset',
            data: d
        })
    })
}
