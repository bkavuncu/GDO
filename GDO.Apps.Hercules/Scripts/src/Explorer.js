'use strict';
const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore'),
    DatasetStore = require('./stores/DatasetStore'),
    ExplorerActions = require('./actions/ExplorerActions'),
    NavActions = require('./actions/NavigationActions');

const W_PAPER = 210,
    H_PAPER = 310,
    P_PAPER = 5;

class Paper extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            width: W_PAPER,
            height: H_PAPER
        }
    }

    changeSize (width, height, animate) {
        this.setState({width, height});
    }

    resetSize () {
        this.setState({
            width: W_PAPER,
            height: H_PAPER
        });
    }

    render () {
        var {width, height} = this.state,
            outerStyle = {
                padding: P_PAPER + 'px',
            },
            innerStyle = {
                width: width + 'px',
                height: height + 'px',
                boxShadow: '0 0 10px gray',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                //padding: P_PAPER + 'px',
                color: 'gray',
                justifyContent: 'center'
            },
            otherProps = _.omit(this.props, 'style');

        return <div style={outerStyle} {...otherProps}>
            <div style={innerStyle}>
                {this.props.children}
            </div>
        </div>;
    }
}

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

const keys = ['name', 'description', 'type', 'origin'],
    substitutes = {
        name: 'column'
    },
    headers = keys.map(k => substitutes[k] || k),
    headerStyle = {
        color: 'black',
        fontSize: '11px',
        textTransform: 'uppercase'
    },
    cellStyle = {
        flexGrow: 1,
        flexShrink: 0
    }, rowStyle = {
        padding: '5px',
        display: 'flex',
        flexGrow: 0,
        flexShrink: 0,
        justifyContent: 'space-around'
    },
    FieldHeader = () => {
        return <div style={rowStyle}>
            {headers.map((k, i) => <div key={i} style={headerStyle}>{k}</div>)}
        </div>
    };

class Row extends React.Component {
    render () {
        var data = this.props.data,
            even = this.props.even,
            cellWidth = this.props.cellWidth,
            style = _.extend({}, rowStyle, {
                justifyContent: 'flex-start',
                backgroundColor: even? '#EDE7F6' : 'none'
            }),
            newCellStyle = _.extend({}, cellStyle, {
                width: cellWidth + 'px'
            });


        return <div style={style}>
            {keys.map(k => <div style={newCellStyle} key={k}>{data[k]}</div>)}
        </div>;
    }
}

let [REST, LOADED, UNLOAD] = [1,2,3];
class DatasetLoaderButton extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            step: DatasetLoaderButton._getLoadState(props)
        };
    }

    static _getLoadState (props) {
        return props.active? LOADED : REST;
    }

    _clickHandler (e) {
        switch (this.state.step) {
            case REST:
                ExplorerActions.selectDataset(this.props.datasetId);
                break;
            case LOADED:
                this.setState({step: UNLOAD});
                break;
            case UNLOAD:
                ExplorerActions.unloadDataset();
                break;
        }

        e.stopPropagation();
    }

    componentWillReceiveProps (newProps) {
        var step = DatasetLoaderButton._getLoadState(newProps);

        this.setState({step});
    }

    _getStyleParams () {
        var backgroundColor, text, iconName,
            color = 'white';

        switch (this.state.step) {
            case REST:
                backgroundColor = '#2196F3';
                text = 'load';
                iconName = 'keyboard_arrow_right';
                break;
            case LOADED:
                backgroundColor = '#4CAF50';
                text = 'loaded';
                iconName = 'done';
                break;
            case UNLOAD:
                backgroundColor = '#FFEB3B';
                color = '#555555';
                text = 'tap to unload';
                iconName = 'eject';
                break;
        }

        return {backgroundColor, text, iconName, color};
    }

    render () {
        var {handler, active} = this.props,
            {backgroundColor, text, iconName, color} = this._getStyleParams(),
            btnStyle = {
                display: 'flex',
                alignSelf: 'stretch',
                flex: '0 0 25px',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '5px',
                boxShadow: 'inset 0 0 3px gray',
                backgroundColor: backgroundColor,
                color: color
            }, text = text,
            icon = iconName;

        return <div style={btnStyle} onTouchTap={this._clickHandler.bind(this)}>
            <span>{text}</span>
            <i className="material-icons">{icon}</i>
        </div>;
    }
}

let [MINI, FULL] = [1,2];
class Dataset extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            step: MINI
        };
    }

    _expand () {
        const MAX_WIDTH = 600,
            MAX_HEIGHT = 310;

        switch(this.state.step){
            case MINI:
                var width = Math.min(this.props.parentSize.width, MAX_WIDTH),
                    height = Math.min(this.props.parentSize.height, MAX_HEIGHT);

                this.refs.paper.changeSize(width, height, false);
                this.setState({step: FULL, width: width});
                break;
            case FULL:
                this.refs.paper.resetSize();
                this.setState({step: MINI});
                break;
        }

    }

    render () {
        var d = this.props.data,
            active = this.props.active,
            fullView = this.state.step === FULL,
            nameStyle = {
                fontSize: '24px',
                paddingBottom: '5px',
                color: 'black'
            }, separator = {
                marginTop: '15px',
                marginBottom: '15px',
                width: '100px',
                borderTop: '1px solid gray'
            }, fieldStyle = {
                borderRadius: '2px',
                padding: '4px',
                border: '1px solid gray'
            }, infoStyle = {
                display: 'flex',
                justifyContent: 'space-around',
                padding: '5px',
                width: '80%'
            }, stretchStyle ={
                flexGrow: 1,
                flexShrink: 0,
                flexBasis: 'auto',
                alignSelf: 'stretch',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }, tableStyle = _.extend({}, stretchStyle, {
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                flexShrink: 1,
                overflow: 'auto'
            });

        var fields = [<div key="name" style={nameStyle}>{d.name}</div>,
                <div key="desc">{d.description}</div>,
                fullView ? null : <div key="sep" style={separator} />,
                <div key="info" style={infoStyle}>
                    <div key="fieldCount" style={fieldStyle}>{d.fields.length} fields</div>
                    <div key="length" style={fieldStyle}>{d.length} rows</div>
                </div>
            ],
            extraFullInfo = null;

        if (fullView) {
            var cellWidth = (this.state.width - 20 /* PADDING */) / keys.length;

            extraFullInfo = <div style={tableStyle}>
                <FieldHeader />
                {d.fields.map(
                    (f, i) =>
                        <Row cellWidth={cellWidth}
                             data={f} key={i}
                             even={(i%2) == 0}/>)}
            </div>;
        }

        return <Paper ref="paper" onTouchTap={() => this._expand()}>
            <div style={stretchStyle}>
                {fields}
            </div>
            {extraFullInfo}
            <DatasetLoaderButton active={active} datasetId={d.id} />
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
                    active={d.id === activeDatasetId}
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
