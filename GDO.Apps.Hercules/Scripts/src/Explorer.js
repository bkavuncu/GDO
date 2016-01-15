'use strict';
const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore'),
    DatasetStore = require('./stores/DatasetStore'),
    ExplorerActions = require('./actions/ExplorerActions'),
    NavActions = require('./actions/NavigationActions'),
    Paper = require('ui/Paper'),
    Dataset = require('./Dataset');

class AddNew extends React.Component {
    _goToImporter () {
        NavActions.goTo('CREATE');
    }

    render () {
        return <Paper onTouchTap={this._goToImporter}>
            <div><i className="material-icons md-48">add_circle_outline</i></div>
            <div>Add New</div>
        </Paper>;
    }
}


class Explorer extends React.Component {
    constructor (props) {
        super(props);

        this.state = {};
    }
    componentDidMount () {
        var el = ReactDOM.findDOMNode(this);

        this.setState({
            width: el.offsetWidth,
            height: el.offsetHeight
        })
    }

    render () {
        const PADDING = 5;
        var outerStyle = {
                backgroundColor: '#80CBC4',
                alignContent: 'flex-start',
                flexGrow: 1,
                height: 'auto',
                padding: PADDING + 'px'
            },
            pSize = null,
            {minisets, active} = this.props,
            activeDatasetId = active? DatasetStore.getActiveDatasetId() : -1;

        if ('width' in this.state) {
            pSize = {
                width: this.state.width - 2 * PADDING,
                height: this.state.height - 2 * PADDING
            }
        }

        return <View style={outerStyle}>
            <AddNew />
            {minisets
                .map((d) => <Dataset
                    key={d.name}
                    data={d}
                    active={d._id === activeDatasetId}
                    parentSize={pSize}/>)}
        </View>;
    }
}

class ExplorerWrapper extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            minisets: []
        };
    }

    componentWillMount () {
        var listener = this._onChange.bind(this);
        DatasetStore.addChangeListener(listener);
        this.setState({listener});

        ExplorerActions.requestMinisets();
    }

    componentWillUnmount () {
        DatasetStore.removeChangeListener(this.state.listener);
    }

    _onChange () {
        this.setState({
            minisets: DatasetStore.getAllSets(),
            active: DatasetStore.hasActiveDataset()
        });
    }

    render () {
        return <Explorer {...this.state}/>;
    }
}

ExplorerWrapper.prototype.tabName = 'Data Explorer';

module.exports = ExplorerWrapper;
