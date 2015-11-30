const React = require('react'),
    GraphBuilder = require('./GraphBuilder'),
    GraphStructure = require('./schemas/GraphStructure'),
    lineGraph = require('./schemas/GraphStructure').lineGraph,
    GraphBuilderStore = require('./stores/GraphBuilderStore'),
    SideMenu = require('./ui/SideMenu');

class GraphPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
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
            fontSize: '-webkit-xxx-large'
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
            <div style={plotButtonStyle}> Plot </div>
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
            sectionLabelList.push("Section "+this.props.sectionList[i].sectionId);
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
        this.state = {};
    }

    componentWillMount () {
        //TEST DATA
        var graphData = GraphStructure.lineGraph,
            sectionData = [{
                sectionId: 1,
                graphData: graphData
            },{
                    sectionId: 2,
                    graphData: graphData
                },{
                    sectionId: 3,
                    graphData: graphData
                }];
        //TEST DATA


        GraphBuilderStore.init(sectionData);
    }

    render () {
        //TEST DATA
        var miniSet = {id: 1,
            name: 'George Lemon',
            description: 'a family friend',
            fields: [
            {
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Integer'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Float'
            },{
                name: 'orange',
                description: 'whatever',
                disabled: false,
                origin: 'artificial',
                type: 'Float'
            },{
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Integer'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Float'
            },{
                name: 'orange',
                description: 'whatever',
                disabled: false,
                origin: 'artificial',
                type: 'Float'
            },{
                name: 'lemon',
                description: 'lemons',
                disabled: false,
                origin: 'native',
                type: 'Enum'
            },{
                name: 'orange',
                description: 'citruses',
                disabled: true,
                origin: 'artificial',
                type: 'Integer'
            },{
                name: 'clementine',
                description: 'citruses',
                disabled: true,
                origin: 'native',
                type: 'Float'
            },{
                name: 'orange',
                description: 'whatever',
                disabled: false,
                origin: 'artificial',
                type: 'Float'
            }
        ],
            disabled: false,
            length: 500,
            source: {
            type: 'URL',
                url: 'http://deez.nuts/data.csv'
        }
    }, graphData = lineGraph,
            sectionData = [{
                sectionId: 1,
                graphData: graphData
            },{
                    sectionId: 2,
                    graphData: graphData
                },{
                    sectionId: 3,
                    graphData: graphData
                }];

        return <GraphControl sectionList={sectionData} miniSet={miniSet}/>;
    }
}

GraphControlWrapper.prototype.tabName = 'Graph Control';

module.exports = GraphControlWrapper;
