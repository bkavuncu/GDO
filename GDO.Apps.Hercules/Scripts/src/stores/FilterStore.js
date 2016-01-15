const DatasetStore = require('./DatasetStore'),
    BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

class FilterStore extends BaseStore {
    constructor() {
        super();

        this.fields = Immutable.Map();
        this.filters = Immutable.Map();

        DatasetStore.addChangeListener(this._onDatasetChange.bind(this));

        this.subscribe(() => this._registerToActions.bind(this));
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'setFilter':
                var {fieldName, data} = action;
                this._applyFilter(fieldName, data);
                break;
        }
        this.emitChange();
    }

    getFieldNameList () {
        return this.fields.map(f => f.name).toList();
    }

    _onDatasetChange () {
        var fields = Immutable.Map().asMutable();

        if (DatasetStore.hasActiveDataset()) {
            var miniset = DatasetStore.getActiveMiniset();

            miniset.fields.forEach((f) => fields.set(f.name, f));
        }

        this.fields = fields.asImmutable();
        this.emitChange();
    }

    _applyFilter (fieldName, filter) {
        if (this.getFieldNameList().contains(fieldName)) {
            this.filters = this.filters.set(fieldName, filter);
        }
    }

    getFilters () {
        return this.filters;
    }

    getFields () {
        return this.fields;
    }
}


module.exports = new FilterStore();
