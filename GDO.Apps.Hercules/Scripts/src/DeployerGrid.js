const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore'),
    DeployerStore = require('./stores/DeployerStore'),
    DeployerActions = require('./actions/DeployerActions'),
    colors = require('colors').deployerColors,
    MeasureComponent = require('ui/MeasureComponent');

const NODE_PADDING = 3;
let [REST, SELECT, MERGE, SECTION, SECTION_SELECTED] = [1,2,3,4];
class DeployerNode extends React.Component {
    _onTap () {
        DeployerActions.toggleNode(this.props.id);
    }

    getColour () {
        switch (this.props.step) {
            case REST:
                return colors.NODE;
            case SELECT:
                return colors.NODE_SELECT;
            case MERGE:
                return colors.NODE_MERGE;
            case SECTION_SELECTED:
                return colors.NODE_SECTION_SELECT;
            case SECTION:
                return colors.NODE_SECTION;
        }
    }
    getBoxShadow () {
        var depth = 5,
            color = 'gray';
        switch (this.props.step) {
            case SELECT:
            case MERGE:
                depth = 15;
                break;
            case SECTION_SELECTED:
                depth = 15;
                color = '#666666';
                break;
        }

        return '0 0 ' + depth + 'px ' + color;
    }
    render () {
        var edge = this.props.edge - 2 * NODE_PADDING,
            fontSize = Math.floor(Math.max(8, Math.min(edge / 2, 30)));

        var outerStyle = {
                display: "flex",
                justifyContent: "center",
                width: edge + 'px',
                height: edge + 'px',
                padding: NODE_PADDING + 'px'
            },
            innerStyle = {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: this.getColour(),
                boxShadow: this.getBoxShadow(),
                transition: 'box-shadow ease 0.3s, background-color ease 0.2s',
                color: 'white',
                fontSize: fontSize + 'px',
                borderRadius: '0px'
            },
            unselectable = require('./ui/styles').unselectable;

        return <View id={'node' + this.props.id }
                     onTouchTap={() => this._onTap()}
                     style={outerStyle}>
            <View style={innerStyle}>
                <div style={unselectable}>{this.props.id + 1}</div>
            </View>
        </View>;
    }
}

const NODE_NUMBER = 64,
    ROWS = 4,
    COLUMNS = NODE_NUMBER / ROWS,
    PADDING = 10;

class JustTheGrid extends React.Component {
    _getOuterStyle () {
        return  {
            display: 'flex',
            flexWrap: 'wrap-reverse',
            //padding: PADDING + 'px',
            backgroundColor: '#80cbc4'
        };
    }

    render () {
        var {width, height, mergeable, selectedNodes, sections} = this.props,
        edge = width / COLUMNS,
        containerHeight = edge * ROWS,
        style = _.extend({}, this._getOuterStyle(), {
            width: width + 'px',
            height: containerHeight + 'px'
        });

        console.log(width);

        var getNodeStep = (nodeId) => {
            if (selectedNodes.contains(nodeId))
                return mergeable? MERGE : SELECT;

            if (sections.size > 0 && DeployerStore.nodeInSection(nodeId)){
                return DeployerStore.isNodeInSelectedSection(nodeId)? SECTION_SELECTED : SECTION;
            }

            return REST;
        },
        nodeList = _.range(0, NODE_NUMBER)
            .map((i) => <DeployerNode
                key={i} id={i}
                step={getNodeStep(i)}
                edge={edge} />);

        return <div style={style}>
            {nodeList}
        </div>;
    }
}
class DeployerGrid extends React.Component {
    render() {
        var outerStyle = {
                alignItems: 'stretch',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center'
            },
            topStyle = {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexGrow: 1
            },
            bottomStyle = {
                display: 'flex',
                flexDirection: 'row',
                //alignItems: 'stretch',
                justifyContent:'flex-end',
                flexGrow: 2
            },
            gridStyle = {
                display: 'flex',
                flexGrow: 1,
                flexWrap: 'wrap-reverse',
                alignItems: 'stretch',
                height: 'auto',
                padding: PADDING + 'px',
                backgroundColor: '#80cbc4',
                width: 'auto'
            };

        var {mergeable, selectedNodes, sections} = this.props;

        return <div style={outerStyle}>
            <View style={topStyle}>
                <SectionManager selectedNodes={selectedNodes} mergeable={mergeable}/>
                <MeasureComponent getChildren={({width, height}) => <JustTheGrid {...{width, sections, height, selectedNodes}} />} />
            </View>
            <View style={bottomStyle}>
                <SectionViewer sections={sections} selectedSectionId={this.props.selectedSectionId}/>
                <GraphPicker selectedSectionId={this.props.selectedSectionId} />
            </View>
        </div>;
    }
}

class GraphPicker extends React.Component {
    _getOuterStyle () {
        return {
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
            textAlign: 'center',
            flex: '0 0 100px'
        };
    }

    _getHandler (graphName) {
        return () => {
            if (this.props.selectedSectionId !== false) {
                DeployerActions.pickGraph(graphName);
            }
        };
    }

    _getSelectorStyle (graphName) {
        var {selectedSectionId} = this.props,
            graphMap = DeployerStore.getGraphMap(),
            commonStyle = {
                margin: '5px',
                flex: '0 1 100px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1
            };

        if (selectedSectionId === false) {
        console.log(selectedSectionId);
            return _.extend({}, commonStyle, {
                backgroundColor: '#C7C7C7',
                color: 'rgba(0,0,0,0.38)'
            })
        } else {
            var backgroundColor = '#2196F3';

            if (graphMap.get(selectedSectionId, false) === graphName.toLowerCase())
                backgroundColor = colors.NODE_SECTION_SELECT;

            return _.extend({}, commonStyle, {
                boxShadow: '0 0 5px #6E6E6E',
                color: 'white',
                backgroundColor: backgroundColor
            });
        }
    }

    render () {
        var {selectedSectionId} = this.props,
            getGraphSelector = (graphName, i) => {
                return <div key={i}
                            style={this._getSelectorStyle(graphName)}
                            onTouchTap={this._getHandler(graphName.toLowerCase())}>
                    {graphName}
                </div>
            }, elems = ['Table', 'Scatter', 'Bar'].map(getGraphSelector);

        return <div style={this._getOuterStyle()}>
            {elems}
        </div>;
    }
}

class SectionManager extends React.Component {
    _createSection () {
        if (!this.props.mergeable)
            return;
        DeployerActions.createSection(this.props.selectedNodes.toOrderedSet().toArray());
    }

    render () {
        var style = {
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
            textAlign: 'center',
            flex: '0 0 100px'
        }, mergeable = this.props.mergeable,
            nodeSet = this.props.selectedNodes;

        return <div style={style}>
            <CreateSection handler={this._createSection.bind(this)} mergeable={mergeable}/>
            <ClearSelection clearable={nodeSet.size > 0} mergeable={mergeable}/>
            <DestroySection />
        </div>;
    }
}

class DeployerButton extends React.Component {
    getText () {
        return 'placeholder';
    }

    getStyle () {
        return {};
    }

    handleTap () {
        return null;
    }

    render () {
        var initialStyle = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            color: 'white',
            margin: '5px',
            borderRadius: '3px',
            boxShadow: '0 0 10px gray',
            backgroundColor: colors.NODE,
            width: 'auto',
            height: 'auto'
        }, finalStyle = _.extend({}, initialStyle, this.getStyle());

        return <View style={finalStyle} onTouchTap={this.handleTap}>
            {this.getText()}
        </View>;
    }


}

class CreateSection extends DeployerButton {
    getText () {
        return 'Create Section';
    }

    getStyle () {
        var buttonColor = this.props.mergeable? colors.NODE_MERGE : colors.NODE;
        return {
            backgroundColor: buttonColor
        };
    }

    handleTap () {
        DeployerActions.createSection();
    }
}

class DestroySection extends DeployerButton {
    getText () {
        return 'Destroy Section';
    }

    getStyle () {
        var buttonColor = DeployerStore.hasSelectedSection()? colors.NODE_SECTION_SELECT : colors.NODE;
        return {
            backgroundColor: buttonColor
        };
    }

    handleTap () {
        DeployerActions.destroySection();
    }
}

class ClearSelection extends DeployerButton {
    getText () {
        return 'Clear Selection';
    }

    getStyle () {
        var buttonColor = this.props.mergeable? colors.NODE_MERGE
            : this.props.clearable? colors.NODE_SELECT : colors.NODE;
        return {
            backgroundColor: buttonColor
        };
    }

    handleTap () {
        DeployerActions.clearSelection();
    }
}

class Section extends React.Component {
    _onTap () {
        DeployerActions.selectSection(this.props.data.id);
    }

    _getOuterStyle () {
        var {selected, data} = this.props;

        return  {
            backgroundColor: selected? colors.NODE_SECTION_SELECT : colors.NODE_SECTION,
            display: 'flex',
            transition: 'box-shadow ease 0.3s, background-color ease 0.2s',
            color: 'white',
            flexDirection: 'column',
            justifyContent: 'center',
            margin: '0px 5px 5px 0px',
            boxShadow: '0 0 ' + (selected? 15 : 5) + 'px gray',
            alignItems: 'center',
            padding: '10px'
        };
    }
    render () {
        var {data} = this.props;
        var selectedGraph = DeployerStore.graphMap.get(data.id);

        return <div style={this._getOuterStyle()} onTouchTap={this._onTap.bind(this)}>
            <div>Section ID: {data.id}</div>
            <div>Nodes: {data.nodeList.sort().map(n => n+1).toArray().toString()}</div>
            <div>Graph: {selectedGraph ? selectedGraph : 'Assign'}</div>
        </div>;
    }
}

class SectionViewer extends React.Component {
    _getOuterStyle () {
        return {
            display: 'flex',
            flexWrap: 'wrap',
            padding: '10px'
        };
    }
    render () {
        var {selectedSectionId, sections} = this.props;

        return <div style={this._getOuterStyle()}>
            {sections.map(s => <Section data={s} key={s.id} selected={selectedSectionId === s.id} />)}
        </div>;
    }
}

class GridWrapper extends React.Component {
    componentWillMount () {
        var listener = this._onChange.bind(this);
        DeployerStore.addChangeListener(listener);
        this.setState({listener});
        this._onChange();
    }

    componentWillUnmount () {
        DeployerStore.removeChangeListener(this.state.listener);
    }

    _onChange () {
        this.setState({
            selectedNodes: DeployerStore.getSelectedNodes(),
            mergeable: DeployerStore.isMergeable(),
            sections: DeployerStore.getSections(),
            selectedSectionId: DeployerStore.hasSelectedSection()?  DeployerStore.getSelectedSectionId() : false,
            graphMap: DeployerStore.getGraphMap()
        });
    }

    render () {
        return <DeployerGrid {...this.state}/>
    }
}

GridWrapper.prototype.tabName = 'Section Deployer';

module.exports = GridWrapper;
