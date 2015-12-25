const Dispatcher = require('../Dispatcher'),
    schemas = require('../schemas/DatasetStructure');

var datasets = [
    {
        id: 1,
        name: 'George Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer',
                stats: {
                    min: 0,
                    max: 1000,
                    median: 400,
                    mean: 150,
                    enum: false,
                    variance: 125,
                    stdDev: 15
                }
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Boolean',
                stats: {
                    min: 0,
                    max: 1000,
                    median: 400,
                    mean: 150,
                    enum: false,
                    variance: 125,
                    stdDev: 15
                }
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

        if (!valid(d))
            console.error(valid.errors(d));

        Dispatcher.dispatch({
            actionType: 'addMiniset',
            data: d
        })
    })
}

export function selectDataset (datasetId) {
    Dispatcher.dispatch({
        actionType: 'selectDataset',
        datasetId: datasetId
    });
}

export function unloadDataset () {
    Dispatcher.dispatch({
        actionType: 'unloadDataset'
    });
}
