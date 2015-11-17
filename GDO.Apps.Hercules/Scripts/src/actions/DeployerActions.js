const Dispatcher = require('../Dispatcher');

export function toggleNode (id) {
    Dispatcher.dispatch({
        actionType: 'toggleNode',
        nodeId: id
    });
}

export function createSection (nodeList) {
    Dispatcher.dispatch({
        actionType: 'createSection',
        nodeList: nodeList
    });
}

export function clearSelection () {
    Dispatcher.dispatch({
        actionType: 'clearSelection'
    });
}
