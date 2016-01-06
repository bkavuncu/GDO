const React = require('react'),
    GraphBuilder = require('./GraphBuilder'),
    GraphStructure = require('./schemas/GraphStructure'),
    barGraph = require('./schemas/GraphStructure').barGraph,
    scatterGraph = require('./schemas/GraphStructure').scatterGraph,
    table = require('./schemas/GraphStructure').table,
    GraphBuilderStore = require('./stores/GraphBuilderStore'),
    DataStore = require('./stores/DatasetStore'),
    DeployerStore = require('./stores/DeployerStore'),
    SideMenu = require('./ui/SideMenu');

class GraphPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            plotted: false
        };
    }

    plot () {
        //Pass box contents from store to render
        this.state.plotted = true;
    }

    render () {

        var panelStyle = {
            flexBasis: '85%',
            padding: '5px',
            display: 'flex',
            flexDirection: 'column'
        }, plotButtonStyle = {
           alignSelf: 'flex-end',
            flexBasis: '50px',
            fontSize: '-webkit-xxx-large',
            border: 'solid #2196F3',
            backgroundColor: '#2196F3',
            boxShadow: '0 0 4px black',
            borderRadius: '5px'
        };

        var graphData;
        for(var section in this.props.sectionList) {
            if(this.props.activeId == section.sectionId) {
                graphData = section.graphData;
            }
        }

        return <div style={panelStyle}>
            <GraphBuilder sectionId={this.props.activeId}
                          miniSet={this.props.miniSet} />
            <div style={plotButtonStyle} onClick={this.plot.bind(this)}> Plot </div>
        </div>;
    }
}

class GraphControl extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            active: 0
        };
    }

    render () {
        var divStyle = {
            display: 'flex',
            alignSelf: 'stretch',
            flexGrow: '1'
        }, selectGraph = (sectionIndex) => {
            this.setState({
                active: sectionIndex
            });
            GraphBuilderStore.setActiveSection(this.props.sectionList[sectionIndex].sectionId);
        }

        var sectionLabelList = [];
        for (var i in this.props.sectionList) {
            sectionLabelList.push("Section "+this.props.sectionList[i].sectionId+ " ("
                +this.props.sectionList[i].graphData.graphType+")");
        }

        return <div style={divStyle}>
            <SideMenu fields={sectionLabelList}
                       onSelect={selectGraph}
                       selectedIndex={this.state.active}/>
            <GraphPanel activeId={this.state.active}
                        miniSet={this.props.miniSet}/>
            </div>;
    }
}

class GraphControlWrapper extends React.Component {
    constructor (props) {
        super(props);

        var miniSet = DataStore.getActiveMiniset(),
            graphMap = DeployerStore.getGraphMap(),
            sectionData = [];

        graphMap.forEach((graphName, id) => {
            var res = {
                    sectionId: id,
                    graphData: this.getGraphData(graphName)
                }
            sectionData.push(res);
        });

        this.state = {
            miniSet: miniSet,
            sectionData: sectionData
        };
    }

    getGraphData (graphName) {
        switch (graphName) {
            case 'scatter':
                return scatterGraph;
            case 'bar':
                return barGraph;
            case 'table':
                return table;
            default:
                console.log('Unknown graph name!');
        }
    }

    componentWillMount () {
        GraphBuilderStore.init(this.state.sectionData);
    }

    render () {
        return <GraphControl sectionList={this.state.sectionData} miniSet={this.state.miniSet}/>;
    }
}

GraphControlWrapper.prototype.tabName = 'Graph Control';

module.exports = GraphControlWrapper;
