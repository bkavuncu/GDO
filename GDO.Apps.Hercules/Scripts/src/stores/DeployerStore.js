const BaseStore = require('./BaseStore'),
    Immutable = require('immutable');

const NODE_NUMBER = 64,
    ROWS = 4,
    COLUMNS = NODE_NUMBER / ROWS,
    PADDING = 10;

class DeployerStore extends BaseStore {
    constructor() {
        super();

        this.activeNodes = Immutable.Set();
        this.sections = Immutable.List();
        this.mergeable = false;

        this.subscribe(() => this._registerToActions.bind(this))
    }

    _registerToActions (action) {
        switch (action.actionType) {
            case 'toggleNode':
                var nodeId = action.nodeId;

                if (this.nodeInSection(nodeId)) {
                    return;
                } else if (this.activeNodes.contains(nodeId))
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
            case 'clearSelection':
                this.activeNodes = Immutable.Set();
                break;
        }
        this.mergeable = this._computeMergeable();
        this.emitChange();
    }

    _makeSection (sectionNodes) {
        var nodeList = sectionNodes.toOrderedSet().toList(),
            sectionId = this.sections.size,
            section = {
                id: sectionId,
                nodeList: nodeList
            };

        this.sections = this.sections.push(section);
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

    isMergeable () {
        return this.mergeable;
    }

    getSelectedNodes () {
        return this.activeNodes;
    }
}

module.exports = new DeployerStore();
