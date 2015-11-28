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
        switch (action.type) {
            case 'setFilter':
                var filter = action.data;
                this._applyFilter(filter);
                break;
        }
        this.emitChange();
    }

    _onDatasetChange () {
        var fields = Immutable.Map().asMutable();

        if (DatasetStore.hasActiveDataset()) {
            var miniset = DatasetStore.getActiveMiniset();

            console.log(miniset.fields, miniset);

            miniset.fields.forEach((f) => fields.set(f.name, f));
        }

        this.fields = fields.asImmutable();
        this.emitChange();
    }

    _applyFilter (filter) {
        var fieldName = filter.field;

        if (this.fields.has(fieldName)) {
            this.filters.set(fieldName, filter);
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
