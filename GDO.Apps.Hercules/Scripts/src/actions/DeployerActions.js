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

export function destroySection () {
    Dispatcher.dispatch({
        actionType: 'destroySection'
    });
}

export function selectSection (sectionId) {
    Dispatcher.dispatch({
        actionType: 'selectSection',
        sectionId: sectionId
    })
}

export function pickGraph (graphName) {
    Dispatcher.dispatch({
        actionType: 'pickGraph',
        graphName: graphName
    });
}
