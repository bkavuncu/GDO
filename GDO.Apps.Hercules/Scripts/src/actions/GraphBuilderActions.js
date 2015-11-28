const Dispatcher = require('../Dispatcher');

export function removeField (field, source) {
    Dispatcher.dispatch({
        actionType: 'removeField',
        field: field,
        source: source
    });
}

export function addField (field, dest) {
    Dispatcher.dispatch({
        actionType: 'addField',
        field: field,
        dest: dest
    });
}

