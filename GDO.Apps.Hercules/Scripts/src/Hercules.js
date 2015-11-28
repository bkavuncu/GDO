'use strict';
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom'),
    NavStore = require('./stores/NavStore');

var View = require('./ui/View.jsx'),
    Tabs = require('./Tabs.js'),
    Importer = require('./Importer');

require('react-tap-event-plugin')();

const DeployerStore = require('stores/DeployerStore'),
    DatasetStore = require('stores/DatasetStore'),
    GraphBuilderStore = require('stores/GraphBuilderStore');

const SectionDeployer = require('./DeployerGrid'),
    Explorer = require('./Explorer'),
    Filter = require('./DataFilter'),
    GraphControl = require('./GraphControl');

let [START, DATA, GRAPH] = [1,2,3];

class Hercules extends React.Component {
    constructor () {
        super();
        this.state = {
            step: START,
            route: NavStore.getRoute()
        };
    }

    componentWillMount () {
        var listener = this._onChange.bind(this);

        NavStore.addChangeListener(listener);
        DatasetStore.addChangeListener(listener);
        DeployerStore.addChangeListener(listener);
        GraphBuilderStore.addChangeListener(listener);

        this.setState({listener});
    }

    componentWillUnmount () {
        var listener = this.state.listener;

        NavStore.removeChangeListener(listener);
        DatasetStore.removeChangeListener(listener);
        DeployerStore.removeChangeListener(listener);
        GraphBuilderStore.removeChangeListener(listener);
    }

    _getState () {
        if (DatasetStore.hasActiveDataset()) {
            if (DeployerStore.hasSelectedSection())
                return GRAPH;
            return DATA;
        }
        return START;
    }

    _onChange () {
        this.setState({
            step: this._getState(),
            route: NavStore.getRoute()
        });
    }

    _getAvailableComponents () {
        switch (this.state.step) {
            case START:
                return [
                    SectionDeployer,
                    Explorer
                ];
            case DATA:
                return [
                    SectionDeployer,
                    Explorer,
                    Filter
                ];
            case GRAPH:
                return [
                    SectionDeployer,
                    Explorer,
                    Filter,
                    GraphControl
                ];
        }
    }

    render () {
        switch (this.state.route) {
            case 'VIEW':
                return <View>
                    <Tabs>
                        {this._getAvailableComponents()}
                    </Tabs>
                </View>;
            case 'CREATE':
                return <View>
                    <Importer />
                </View>;
        }
    }
}

ReactDOM.render(
    <Hercules />,
    document.getElementById("react-target")
);
