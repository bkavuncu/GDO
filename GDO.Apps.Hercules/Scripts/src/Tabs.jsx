const React = require('react'),
    View = require('./ui/View.jsx');


var DeployerGrid = require('./DeployerGrid.jsx'),
    DataExplorer, DataEnricher, DataFilter, GraphControl;

class Tab extends React.Component {
    render () {
        var name = this.props.name,
            color = this.props.active? '#00BCD4' : '#009688',
            tabStyle = {
                flexGrow: 1,
                width: 'auto',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: color,
                transition: 'background-color ease-in 0.3s'
            };

        return (
            <View style={tabStyle} onClick={() => this.props.handleClick(name)}>
                {name}
            </View>
        );
    }
}

let TABS = {
    "Section Deployment": DeployerGrid,
    "Data Explorer": DataExplorer,
    "Data Enricher": DataEnricher,
    "Data Filter": DataFilter,
    "Graph Control": GraphControl
};

class Tabs extends React.Component {
    constructor () {
        super();

        this.state = {
            active: "Section Deployment"
        };
    }

    render () {
        var activeTab = this.state.active,
            SelectedComponent = TABS[activeTab] || 'TODO',
            handleClick = (tabName) => {
                this.setState({
                    active: tabName
                });
            },
            pageStyle = {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                alignItems: 'flex-start'
            },
            tabsStyle = {
                display: 'flex',
                height: '40px',
                flexGrow: 0,
                textTransform: 'capitalize',
                color: 'white',
                fontFamily: 'sans-serif'
            },
            contentStyle = {
                height: 'auto',
                flexGrow: '1'
            };

        return (
            <div style={pageStyle}>
                <View style={tabsStyle}>
                    {Object.keys(TABS).map( function(tabKey) {
                        return (
                            <Tab active={tabKey === activeTab}
                                 handleClick={handleClick}
                                 key={tabKey}
                                 name={tabKey}/>
                        );
                    }.bind(this))}
                </View>
                <View style={contentStyle} id='content'>
                    {typeof SelectedComponent == 'function'? <SelectedComponent /> : <View>{SelectedComponent}</View>}
                </View>
            </div>
        );
    }
}

module.exports = Tabs;
