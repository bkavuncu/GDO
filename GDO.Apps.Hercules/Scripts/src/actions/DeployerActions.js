const Dispatcher = require('../Dispatcher');

export function toggleNode (id) {
    Dispatcher.dispatch({
        actionType: 'toggleNode',
        nodeId: id
    });
}

export function createSection () {
    Dispatcher.dispatch({
        actionType: 'createSection'
    });
}

export function clearSelection () {
    Dispatcher.dispatch({
        actionType: 'clearSelection'
    });
}
