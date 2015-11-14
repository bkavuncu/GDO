const Dispatcher = require('../Dispatcher');

export function goTo (newRoute) {
    Dispatcher.dispatch({
        actionType: 'changeRoute',
        route: newRoute
    });
}

export function goBack () {
    Dispatcher.dispatch({
        actionType: 'goBack'
    });
}
