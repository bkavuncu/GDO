const BaseStore = require('./BaseStore'),
    _ = require('underscore'),
    Immutable = require('immutable');

class GraphBuilderStore extends BaseStore {
    constructor() {
        super();

        //sectionMap<sectionId, Map<axisName, Set<field>>>
        this.sectionMap = Immutable.Map();
        //sectionDataMap<sectionId, Map<axisName, dimension>>
        this.sectionDataMap = Immutable.Map();
        this.empty = true;

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'removeField':
                this.removeField(action.source, action.field);
                break;
            case 'addField':
                this.addField(action.dest, action.field);
                break;
        }
        this.emitChange();
    }

    init (sectionData) {
        if(sectionData.length > 0) {
            this.activeSection = sectionData[0].sectionId;
            this.isEmpty = false;
        } else {
            this.isEmpty = true;
        }
        for (var i=0; i<sectionData.length; i++) {
            var sectionId = sectionData[i].sectionId;
            var dimensions = sectionData[i].graphData.dimensions;
            var axesSet = Immutable.Map();
            var dimensionSet = Immutable.Map();
            for (var j=0; j<dimensions.length; j++) {
                var fields = Immutable.Set();
                axesSet = axesSet.set(dimensions[j].name, fields);
                dimensionSet = dimensionSet.set(dimensions[j].name, dimensions[j]);
            }
            this.sectionMap = this.sectionMap.set(sectionId, axesSet);
            this.sectionDataMap = this.sectionDataMap.set(sectionId, dimensionSet);
        }
    }

    removeField(dimension, field) {
        var axesSet = this.sectionMap.get(this.activeSection);
        var fields = axesSet.get(dimension);
        fields = fields.delete(field);
        axesSet = axesSet.set(dimension, fields);
        this.sectionMap = this.sectionMap.set(this.activeSection, axesSet);
        this.emitChange();
    }

    addField(dimension, field) {
        var axesSet = this.sectionMap.get(this.activeSection);
        var fields = axesSet.get(dimension);
        fields = fields.add(field);
        axesSet = axesSet.set(dimension, fields);
        this.sectionMap = this.sectionMap.set(this.activeSection, axesSet);
        this.emitChange();
    }

    setActiveSection (sectionId) {
        this.activeSection = sectionId;
        this.emitChange();
    }

    getActiveSection () {
        return this.activeSection;
    }

    //Returns a Map<axisName, Set<Field>>
    getAxes() {
        return this.sectionMap.get(this.activeSection);
    }

    //Returns and object 'dimension' with fields {name, singleField, validTypes}
    getDimensionData(dimensionName) {
        var dimensionSet = this.sectionDataMap.get(this.activeSection);
        return dimensionSet.get(dimensionName);
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

    isEmpty() {
        return this.empty;
    }

    toHerculesObject (sectionId) {
        var axisSet = this.sectionMap.get(sectionId);
        return axisSet.map((s) => {
            var {axisName, fields} = s,
                res = {
                    axisName: axisName,
                    fields: fields.toArray()
                };
            return res;
        }).toJS();
    }

    _fromHerculesObject (sections) {
        //TODO
    }

}

module.exports = new GraphBuilderStore();
