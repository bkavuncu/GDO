const BaseStore = require('./BaseStore'),
    builderStore = require('./GraphBuilderStore'),
    Immutable = require('immutable'),
    _ = require('underscore'),
    assert = require('assert');

const NODE_NUMBER = 64,
    ROWS = 4,
    COLUMNS = NODE_NUMBER / ROWS,
    PADDING = 10,
    NO_SECTION_SELECTED = -1;

class DeployerStore extends BaseStore {
    constructor() {
        super();

        this._clear();

        this.subscribe(() => this._registerToActions.bind(this));
    }

    _clear () {
        this.activeNodes = Immutable.Set();
        this.sections = Immutable.List();
        this.selectedSectionId = NO_SECTION_SELECTED;
        this.graphMap = Immutable.Map();
        this.mergeable = false;
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'toggleNode':
                var nodeId = action.nodeId;

                if (this.nodeInSection(nodeId))
                    this._selectSection(this.getNodeSectionId(nodeId));
                else if (this.activeNodes.contains(nodeId))
                    this.activeNodes = this.activeNodes.remove(nodeId);
                else
                    this.activeNodes = this.activeNodes.add(nodeId);
                break;
            case 'createSection':
                if (this.mergeable) {
                    var sectionNodes = this.getSelectedNodes();
                    this.activeNodes = Immutable.Set();
                    this._makeSection(sectionNodes);
                }
                break;
            case 'destroySection':
                if (this.hasSelectedSection()) {
                    var targetId = this.getSelectedSectionId();
                    this.sections = this.sections.filter((s) => s.id !== targetId);
                    this.graphMap = this.graphMap.remove(targetId);
                    this.selectedSectionId = NO_SECTION_SELECTED;
                }
                break;
            case 'selectSection':
                this._selectSection(action.sectionId);
                break;
            case 'clearSelection':
                this.activeNodes = Immutable.Set();
                break;
            case 'pickGraph':
                var {graphName} = action;
                this._bindToGraph(graphName);
                break;
            case 'restoreState':
                var {sections} = action.data;
                this._fromHerculesObject(sections);
        }
        this.mergeable = this._computeMergeable();
        this.emitChange();
    }

    _makeSection (sectionNodes) {
        var nodeList = sectionNodes.toOrderedSet().toList(),
            maxSectionId = this.sections.map(s => s.id).reduce((prev, curr) => Math.max(prev, curr), -1),
            sectionId = maxSectionId + 1,
            section = {
                id: sectionId,
                nodeList: nodeList
            };

        this.sections = this.sections.push(section);
        this.selectedSectionId = sectionId;
    }

    getSections () {
        return this.sections;
    }

    nodeInSection (nodeId) {
        return this.getSections().map((section) => {
            return section.nodeList.contains(nodeId);
        }).reduce((prev, curr) => prev || curr, false);
    }

    _computeMergeable () {
        var nodeSet = this.getSelectedNodes(),
            rows = [0,1,2,3];

        var nodesPerRow = rows.map((r) => {
            return nodeSet.filter(
                (nodeIndex) =>
                (r * COLUMNS) <= nodeIndex && nodeIndex < ((r+1) * COLUMNS)
            ).sort().toArray()
        });

        var nonNullRows = nodesPerRow.filter((a) => a.length > 0);

        if (nonNullRows.length === 0)
            return false;

        var prevRowStartIndex = null;
        var prevRowLength = null;
        for (var i = 0; i < nonNullRows.length; i++) {
            var row = nonNullRows[i];
            var startIndex = row[0] % COLUMNS;

            // Check continuity
            if (row[row.length - 1] - row[0] !== row.length - 1) {
                return false;
            }

            // Check row starts at same index as previous row (if any) and has same length
            if (prevRowStartIndex === null) {
                prevRowStartIndex = startIndex;
                prevRowLength = row.length;
            } else if (prevRowStartIndex !== startIndex || row.length !== prevRowLength) {
                return false;
            }
        }

        return true;
    }

    _selectSection (sectionId) {
        this.selectedSectionId = this.selectedSectionId === sectionId? NO_SECTION_SELECTED : sectionId;
    }

    getNodeSectionId (nodeId) {
        //assert(this.nodeInSection(nodeId), 'the node does not belong in any section');
        if (!this.nodeInSection(nodeId))
            return -1;

        var targetSections = this.sections.filter(s => s.nodeList.contains(nodeId));

        assert(targetSections.size === 1, 'the node is in more than one section');

        return targetSections.get(0).id;
    }

    isNodeInSelectedSection (nodeId) {
        return this.hasSelectedSection()
            && this.nodeInSection(nodeId)
            && this.getNodeSectionId(nodeId) === this.selectedSectionId;
    }

    hasSelectedSection () {
        return 0 <= this.selectedSectionId;
    }

    isMergeable () {
        return this.mergeable;
    }

    getSelectedNodes () {
        return this.activeNodes;
    }

    getSelectedSectionId () {
        assert(this.hasSelectedSection(), 'no section selected');
        return this.selectedSectionId;
    }

    getGraphMap () {
        return this.graphMap;
    }

    _checkSectionExists (sectionId) {
        assert(this.sections.filter(s => s.id === sectionId).size > 0, 'the section does not exist');
    }

    _bindToGraph (graphName) {
        if (this.hasSelectedSection()) {
            this.graphMap = this.graphMap.set(this.getSelectedSectionId(), graphName);
        }
    }

    isGraphAssigned (sectionId) {
        return this.graphMap.get(sectionId);
    }

    toHerculesObject () {
        return this.sections.map((s) => {
            var {id, nodeList} = s,
                res = {
                    id: id,
                    nodeList: nodeList.toArray()
                };

            if (this.graphMap.has(s.id)) {
                var dims = builderStore.toHerculesObject(id);
                var graphName = this.graphMap.get(s.id);
                var deployed = {graphName, dims};
                res = _.extend({}, res, {
                    deployed: deployed
                });
            }

            return res;
        }).toJS();
    }

    _fromHerculesObject (sections) {
        this._clear();

        sections.forEach((s) => {
            var {id, nodeList, graph} = s;
                nodeList = Immutable.List(nodeList);

            this.sections = this.sections.push({id, nodeList});

            if (typeof graph !== null)
                this.graphMap = this.graphMap.set(id, graph.graphName);
        });
    }
}

module.exports = new DeployerStore();
