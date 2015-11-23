const React = require('react'),
    GraphBuilder = require('./GraphBuilder');

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
            {this.props.sectionData.graphData.type}
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
                    s => <GraphItem sectionData={s}
                                    select={this.props.selector}
                                    activeId={this.props.activeId}/>
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
            display: 'flex'
        }
        return <div style={panelStyle}> <GraphBuilder/> </div>;
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
            })
        }
        return <div style={divStyle}>
            <GraphList sectionList={this.props.sectionList}
                       selector={selectGraph}
                       activeId={this.state.active}/>
            <GraphPanel activeSection={this.state.active}/>
            </div>;
    }
}

class GraphControlWrapper extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    render () {
        var BarData = {
            type: 'BAR',
            xAxis: [1,2,3,4],
            yAxis: [1,1,0,1]
        },  LineData = {
            type: 'LINE',
            xAxis: [1,2,3,4,5],
            yAxis: [1.3, 4.4, 5.3, 2.1, 8.6]
        },  sectionList = [
            {sectionId: 1,
            graphData: BarData},
            {sectionId: 2,
            graphData: LineData}
        ];
        return <GraphControl sectionList={sectionList}/>;
    }
}

module.exports = GraphControlWrapper;
