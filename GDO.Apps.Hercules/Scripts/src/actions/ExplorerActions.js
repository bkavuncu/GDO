const Dispatcher = require('../Dispatcher'),
    schemas = require('../schemas/DatasetStructure'),
    gdo = parent.gdo,
    datasets = [
    {
        _id: 1,
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
        sourceType: 'URL',
        sourceOrigin: 'http://deez.nuts/data.csv'
    }
];

if (typeof $ != undefined) {
    if (gdo) {
        gdo.net.app.Hercules.receiveMinisets = (minisets) => {
            console.log('your butt', minisets);
            if (typeof minisets == 'string') {
                minisets = JSON.parse(minisets);
            }

            minisets.map ((d) => {
                var valid = schemas.validMiniset;

                if (!valid(d))
                    console.error(valid.errors(d));

                Dispatcher.dispatch({
                    actionType: 'addMiniset',
                    data: d
                })
            });
        }
    }
    
}

export function requestMinisets () {
    if (gdo) {
        gdo.net.app.Hercules.server.getDatasets(0);
    }
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
