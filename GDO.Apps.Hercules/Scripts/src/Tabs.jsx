const React = require('react'),
    View = require('./ui/View.jsx');


var DeployerGrid = require('./DeployerGrid.jsx'),
    DataExplorer, DataEnricher, DataFilter, GraphControl;

class SectionDeployer extends React.Component {
    render () {
        return <View><DeployerGrid /></View>;
    }
}

class Tab extends React.Component {
    render () {
        var name = this.props.name;
        return (
            <div onClick={() => this.props.handleClick(name)}>
                {name}
            </div>
        );
    }
}

let TABS = {
    "Section Deployment": SectionDeployer,
    "Data Explorer": DataExplorer,
    "Data Enricher": DataEnricher,
    "Data Filter": DataFilter,
    "Graph Control": GraphControl
};

class Tabs extends React.Component {
    constructor () {
        super();

        this.state = {
            component: SectionDeployer
        };
    }

    handleClick (tabName) {
        this.setState({
            component: TABS[tabName]
        });
    }

    render () {
        var SelectedComponent = this.state.component || 'TODO';

        return (
            <View>
                <div>
                    {Object.keys(TABS).map( function(tabKey) {
                        return (
                            <Tab handleClick={this.handleClick}
                                 key={tabKey}
                                 name={tabKey}/>
                        );
                    }.bind(this))}
                </div>
                <SelectedComponent />
            </View>
        );
    }
}

module.exports = Tabs;
