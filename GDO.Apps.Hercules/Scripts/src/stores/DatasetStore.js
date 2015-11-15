const BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

class DatasetStore extends BaseStore {
    constructor() {
        super();

        this.miniSets = Immutable.Map();
        this.fullSets = Immutable.Map();

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'addMiniset':
                var miniset = action.data;
                this.miniSets = this.miniSets.set(miniset.id, miniset);
                break;
            case 'addFullset':
                var fullset = action.data;
                this.fullSets = this.fullSets.set(fullset.id, fullset);
                break;
        }
        this.emitChange();
    }

    getMiniSet (id) {
        return this.miniSets.get(id);
    }

    getFullSet (id) {
        return this.fullSets.get(id);
    }

    getAllSets () {
        return this.miniSets.toList();
    }
}

module.exports = new DatasetStore();
