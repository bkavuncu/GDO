const BaseStore = require('./BaseStore'),
    Immutable = require('immutable'),
    assert = require('assert');

class DatasetStore extends BaseStore {
    constructor() {
        super();

        this.miniSets = Immutable.Map();
        this.selected = null;

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'addMiniset':
                var miniset = action.data;
                this.miniSets = this.miniSets.set(miniset.id, miniset);
                break;
            case 'selectDataset':
                this._select(action.datasetId);
                break;
            case 'unloadDataset':
                this.selected = null;
                break;
        }
        this.emitChange();
    }

    _select (id) {
        if(this.miniSets.has(id)) {
            this.selected = id;
        }
    }

    hasActiveDataset () {
        return !!this.selected;
    }

    getActiveDatasetId () {
        assert(this.hasActiveDataset());

        return this.selected;
    }

    getActiveMiniset () {
        return this.getMiniSet(this.getActiveDatasetId());
    }

    getMiniSet (id) {
        return this.miniSets.get(id);
    }

    getAllSets () {
        return this.miniSets.toList();
    }
}

module.exports = new DatasetStore();
