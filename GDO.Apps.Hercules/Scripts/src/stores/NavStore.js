var BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

export default class NavStore extends BaseStore {
    constructor() {
        super();

        this.validRoutes = Immutable.List(['CREATE', 'VIEW']);
        this.history = Immutable.Stack();
        this.history = history.push('VIEW');

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'changeRoute':
                var newRoute = action.validRoutes.toUppercase();
                if(newRoute != this.route && this.validRoutes.contains(newRoute)) {
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
