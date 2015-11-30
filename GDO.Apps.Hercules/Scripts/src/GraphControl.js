const React = require('react'),
    GraphBuilder = require('./GraphBuilder'),
    GraphStructure = require('./schemas/GraphStructure'),
    lineGraph = require('./schemas/GraphStructure').lineGraph,
    GraphBuilderStore = require('./stores/GraphBuilderStore');

class GraphItem extends React.Component {
    constructor (props) {
        super(props);

        this.state = {};
    }

    _onTap () {
        this.props.select(this.props.sectionData);
    }

    render () {
        var itemStyle;
        if(this.props.sectionData.sectionId == this.props.activeId) {
            itemStyle = {
                width: '100%',
                flex: '1'
            }
        } else {
            itemStyle = {
                width: '100%',
                flex: '1',
                backgroundColor: '#009688'
            }
        }

        return <div style={itemStyle}
                    onTouchTap={this._onTap.bind(this)}>
            {this.props.sectionData.sectionId}
            {this.props.sectionData.graphData.graphType}
        </div>;
    }
}

class GraphList extends React.Component {
    constructor (props) {
        super(props);

        this.state = {};
    }

    render () {
        var listStyle = {
            flexBasis: '15%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            alignContent: 'stretch',
            alignItems: 'stretch'
        }

        return <div style={listStyle}>
            {this.props.sectionList.map(
                    s => <GraphItem key={s.sectionId}
                                    sectionData={s}
                                    select={this.props.selector}
                                    activeId={this.props.activeId}
                                    key={s.id}
                        />
            )}
        </div>;
    }
}

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
            active: this.props.sectionList[0].sectionId
        };
    }

    render () {
        var divStyle = {
            display: 'flex',
            alignSelf: 'stretch',
            flexGrow: '1'
        }, selectGraph = (sectionData) => {
            this.setState({
                active: sectionData.sectionId
            });
            GraphBuilderStore.setActiveSection(sectionData.sectionId);
        }
        return <div style={divStyle}>
            <GraphList sectionList={this.props.sectionList}
                       selector={selectGraph}
                       activeId={this.state.active}/>
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
        var miniSet = {
                id: 2,
                name: 'Sam Lemon',
                description: 'a family friend',
                fields: [
                    {
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
