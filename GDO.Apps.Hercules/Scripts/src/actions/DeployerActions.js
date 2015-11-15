const Dispatcher = require('../Dispatcher');

export function toggleNode (id) {
    Dispatcher.dispatch({
        actionType: 'toggleNode',
        nodeId: id
    });
}
