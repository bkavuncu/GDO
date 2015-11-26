const BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

class GraphBuilderStore extends BaseStore {
    constructor() {
        super();

        this.sectionMap = Immutable.Map();

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'removeField':
                this.removeField(action.source, action.field, action.sectionId);
                break;
            case 'addField':
                this.addField(action.dest, action.field, action.sectionId);
                break;
        }
        this.emitChange();
    }

    init (sectionData) {
        for (var i=0; i<sectionData.length; i++) {
            var sectionId = sectionData[i].sectionId;
            var dimensions = sectionData[i].graphData.dimensions;
            var axesSet = Immutable.Map();
            for (var j=0; j<dimensions.length; j++) {
                var fields = Immutable.Set();
                axesSet = axesSet.set(dimensions[j].name, fields);
            }
            this.sectionMap = this.sectionMap.set(sectionId, axesSet);
        }
    }

    removeField(dimension, field, sectionId) {
        var axesSet = this.sectionMap.get(sectionId);
        var fields = axesSet.get(dimension);
        fields = fields.delete(field);
        axesSet = axesSet.set(dimension, fields);
        this.sectionMap = this.sectionMap.set(sectionId, axesSet);
        this.emitChange();
    }

    addField(dimension, field, sectionId) {
        var axesSet = this.sectionMap.get(sectionId);
        var fields = axesSet.get(dimension);
        fields = fields.add(field);
        axesSet = axesSet.set(dimension, fields);
        this.sectionMap = this.sectionMap.set(sectionId, axesSet);
        this.emitChange();
    }

    getAxes(sectionId) {
        return this.sectionMap.get(sectionId);
    }

    getUnselected() {
        return this.unselectedAxis;
    }

    getXAxis() {
        return this.selectedX;
    }

    getYAxis() {
        return this.selectedY;
    }

}

module.exports = new GraphBuilderStore();
