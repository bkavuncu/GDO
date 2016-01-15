const Dispatcher = require('../Dispatcher');

export function setFilter (field, filter) {
    Dispatcher.dispatch({
        actionType: 'setFilter',
        fieldName: field,
        data: filter
    })
};
