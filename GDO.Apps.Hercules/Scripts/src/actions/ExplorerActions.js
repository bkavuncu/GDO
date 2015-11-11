const Dispatcher = require('../Dispatcher');

var datasets = [
    {
        id: 1,
        name: 'George Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                type: 'enum'
            },{
                name: 'orange',
                type: 'number'
            }
        ]
    },{
        id: 2,
        name: 'Sam Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                type: 'enum'
            },{
                name: 'orange',
                type: 'number'
            }
        ]
    },{
        id: 3,
        name: 'Gina Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                type: 'enum'
            },{
                name: 'orange',
                type: 'number'
            }
        ]
    }
];

export function requestMinisets () {
    datasets.map ((d) => {
        Dispatcher.dispatch({
            actionType: 'addMiniset',
            data: d
        })
    })
}
