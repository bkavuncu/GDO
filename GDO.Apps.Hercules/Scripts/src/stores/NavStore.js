var BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

class NavStore extends BaseStore {
    constructor() {
        super();

        this.validRoutes = Immutable.List(['CREATE', 'VIEW']);
        this.history = Immutable.Stack();
        this.history = this.history.push('VIEW');

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'changeRoute':
                var newRoute = action.route.toUpperCase();
                if(newRoute != this.getRoute() && this.validRoutes.contains(newRoute)) {
                    this.history = this.history.push(newRoute);
                    this.emitChange();
                }
                break;
            case 'goBack':
                this.history = this.history.pop();
                this.emitChange();
                break;
        }
    }

    getRoute () {
        return this.history.peek();
    }
}

module.exports = new NavStore();
