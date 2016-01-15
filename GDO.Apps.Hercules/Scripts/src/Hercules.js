'use strict';
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom'),
    NavStore = require('./stores/NavStore');

var View = require('./ui/View.jsx'),
    unselectable = require('ui/styles').unselectable,
    Tabs = require('./Tabs.js'),
    Importer = require('./Importer');

require('react-tap-event-plugin')();

const DeployerStore = require('stores/DeployerStore'),
    DatasetStore = require('stores/DatasetStore'),
    GraphBuilderStore = require('stores/GraphBuilderStore');

const SectionDeployer = require('./DeployerGrid'),
    Explorer = require('./Explorer'),
    Filter = require('./filter/DataFilter'),
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

    _getStep () {
        if (DatasetStore.hasActiveDataset()) {
            if (DeployerStore.hasSelectedSection())
                return GRAPH;
            return DATA;
        }
        return START;
    }

    _onChange () {
        this.setState({
            step: this._getStep(),
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
        var innerElems;

        switch (this.state.route) {
            case 'VIEW':
                innerElems = <Tabs>
                        {this._getAvailableComponents()}
                    </Tabs>;
                break;
            case 'CREATE':
                innerElems = <Importer />;
                break;
        }

        return <View style={unselectable}>
            {innerElems}
        </View>;
    }
}

ReactDOM.render(
    <Hercules />,
    document.getElementById("react-target")
);
