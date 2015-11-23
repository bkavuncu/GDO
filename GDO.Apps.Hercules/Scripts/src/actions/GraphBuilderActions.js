const Dispatcher = require('../Dispatcher');

export function moveField (fieldName, source, dest) {
    Dispatcher.dispatch({
        actionType: 'moveField',
        nodeId: id
    });
}

