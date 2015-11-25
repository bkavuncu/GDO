const Dispatcher = require('../Dispatcher');

export function removeField (sectionId, field, source) {
    Dispatcher.dispatch({
        actionType: 'removeField',
        sectionId: sectionId,
        field: field,
        source: source
    });
}

export function addField (sectionId, field, dest) {
    Dispatcher.dispatch({
        actionType: 'addField',
        sectionId: sectionId,
        field: field,
        dest: dest
    });
}

