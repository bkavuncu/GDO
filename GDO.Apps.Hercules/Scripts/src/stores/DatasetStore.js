const BaseStore = require('./BaseStore'),
    Immutable = require('immutable'),
    assert = require('assert');

class DatasetStore extends BaseStore {
    constructor() {
        super();
        this._clear();

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _clear () {
        this.miniSets = Immutable.Map();
        this.selected = null;
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'addMiniset':
                var miniset = action.data;
                this.miniSets = this.miniSets.set(miniset._id, miniset);
                break;
            case 'selectDataset':
                this._select(action.datasetId);
                break;
            case 'unloadDataset':
                this.selected = null;
                break;
            case 'restoreState':
                var {minisets} = action.data;
                this._fromHerculesObject(minisets);
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

    toHerculesObject () {
        // converts Immutable List to simple Array
        return this.getAllSets().toJS();
    }

    _fromHerculesObject (minisetArray) {
        this._clear();
        // Store minisets in minisetArray in this temporarily mutable Map, using `id' as key
        var newMinisets = Immutable.Map().asMutable();

        minisetArray.forEach((miniset) => {
            newMinisets.set(miniset._id, miniset);
        });


        this.miniSets = newMinisets.asImmutable();
    }
}

module.exports = new DatasetStore();
