const BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

class DeployerStore extends BaseStore {
    constructor() {
        super();

        this.activeNodes = Immutable.Set();

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'toggleNode':
                if (this.activeNodes.contains(action.nodeId))
                    this.activeNodes = this.activeNodes.remove(action.nodeId);
                else
                    this.activeNodes = this.activeNodes.add(action.nodeId);
                break;
        }
        this.emitChange();
    }

    getSelectedNodes () {
        return this.activeNodes;
    }
}

module.exports = new DeployerStore();
