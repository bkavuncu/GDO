'use strict';
const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore'),
    DatasetStore = require('./stores/DatasetStore'),
    ExplorerActions = require('./actions/ExplorerActions');

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
                padding: P_PAPER + 'px',
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
    render () {
        return <Paper>
            <div><i className="material-icons md-48">add_circle_outline</i></div>
            <div>Add New</div>
        </Paper>;
    }
}

let [MINI, EXPAND, FULL, COLLAPSE] = [1,2,3,4];
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
                this.setState({step: FULL});
                break;
            case FULL:
                this.refs.paper.resetSize();
                this.setState({step: MINI});
                break;
        }

    }

    render () {
        var d = this.props.data,
            nameStyle = {
                fontSize: '24px',
                paddingBottom: '5px',
                color: 'black'
            },
            separator = {
                marginTop: '15px',
                marginBottom: '15px',
                width: '100px',
                borderTop: '1px solid gray'
            },
            fieldStyle = {
                borderRadius: '2px',
                padding: '4px',
                border: '1px solid gray'
            };

        return <Paper ref="paper" onTouchTap={() => this._expand()}>
            <div style={nameStyle}>{d.name}</div>
            <div>{d.description}</div>
            <div style={separator} />
            <div style={fieldStyle}>{d.fields.length} fields</div>
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
            pSize = null;

        if ('width' in this.state) {
            pSize = {
                width: this.state.width - 2 * PADDING,
                height: this.state.height - 2 * PADDING
            }
        }

        return <View style={outerStyle}>
            <AddNew />
            {this.props.minisets
                .map((d) => <Dataset
                    key={d.name}
                    data={d}
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
            minisets: DatasetStore.getAllSets()
        });
    }

    render () {
        return <Explorer minisets={this.state.minisets} />;
    }
}

module.exports = ExplorerWrapper;
