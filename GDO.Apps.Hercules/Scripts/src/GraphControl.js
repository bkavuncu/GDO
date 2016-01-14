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

if (parent.gdo) {
    var gdo = parent.gdo,
        server = gdo.net.app.Hercules.server,
        instanceId = gdo.management.selectedInstance;
}



var testData = [
      {
          "x": 5,
          "y": 1
      },
      {
          "x": 0.8,
          "y": 0.6967067093471654
      },
      {
          "x": 1.6,
          "y": -0.029199522301288815
      },
      {
          "x": 2.4,
          "y": -0.7373937155412454
      },
      {
          "x": 3.2,
          "y": -0.9982947757947531
      },
      {
          "x": 4,
          "y": -0.6536436208636119
      },
      {
          "x": 4.8,
          "y": 0.0874989834394464
      },
      {
          "x": 5.6,
          "y": 0.7755658785102495
      },
      {
          "x": 6.4,
          "y": 0.9931849187581926
      },
      {
          "x": 7.2,
          "y": 0.6083513145322546
      },
      {
          "x": 8,
          "y": -0.14550003380861354
      },
      {
          "x": 8.8,
          "y": -0.811093014061656
      },
      {
          "x": 9.6,
          "y": -0.984687855794127
      },
      {
          "x": 10.4,
          "y": -0.5609842574272288
      },
      {
          "x": 11.2,
          "y": 0.2030048638187504
      },
      {
          "x": 12,
          "y": 0.843853958732492
      },
      {
          "x": 12.8,
          "y": 0.9728325656974354
      },
      {
          "x": 13.6,
          "y": 0.511703992453149
      },
      {
          "x": 14.4,
          "y": -0.25981735621375585
      },
      {
          "x": 15.2,
          "y": -0.8737369830110802
      },
      {
          "x": 16,
          "y": -0.9576594803233847
      },
      {
          "x": 16.8,
          "y": -0.46067858741136253
      },
      {
          "x": 17.6,
          "y": 0.31574375491924334
      },
      {
          "x": 18.4,
          "y": 0.9006401723847685
      },
      {
          "x": 19.2,
          "y": 0.9392203466968708
      },
      {
          "x": 20,
          "y": 0.40808206181339196
      },
      {
          "x": 20.8,
          "y": -0.37059332583764143
      },
      {
          "x": 21.6,
          "y": -0.9244717749141217
      },
      {
          "x": 22.4,
          "y": -0.9175780505318613
      },
      {
          "x": 23.2,
          "y": -0.35409379339635894
      },
      {
          "x": 24,
          "y": 0.424179007336997
      },
      {
          "x": 24.8,
          "y": 0.9451505141481711
      },
      {
          "x": 25.6,
          "y": 0.8928064017629097
      }
];
var order = function (name, args) {
    return JSON.stringify({ name: name, args: args });
};

class GraphPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            plotted: false
        };
    }

    plot () {
        //Pass box contents from store to renderer
        var axesMap = GraphBuilderStore.getAxesSet().toJS();
        var activeMiniSet = DataStore.getActiveMiniset();
        var dsId = activeMiniSet._id;
        console.log(axesMap);
        server.setAxesMap(0, JSON.stringify(axesMap), dsId);
        this.setState({plotted: true});
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

        if (GraphBuilderStore.isEmpty) {
            plotButtonStyle.display = 'none';
        } else {
            plotButtonStyle.display = 'block';
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
