const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore'),
    DeployerStore = require('./stores/DeployerStore'),
    DeployerActions = require('./actions/DeployerActions');

const NODE_PADDING = 3;
class DeployerNode extends React.Component {
    _onTap () {
        DeployerActions.toggleNode(this.props.id);
    }
    render () {
        var edge = Math.min(this.props.width, this.props.height) - 2 * NODE_PADDING,
            fontSize = Math.floor(Math.max(8, Math.min(edge / 2, 30)));

        var selected = this.props.selected,
            outerStyle = {
                display: "flex",
                justifyContent: "center",
                width: edge + 'px',
                height: edge + 'px',
                padding: NODE_PADDING + 'px'
            }, color = selected? '#00BCD4' : '#1976D2',
            boxShadowDepth = selected? 15 : 5,
            innerStyle = {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: color,
                boxShadow: '0 0 '+ boxShadowDepth +'px gray',
                transition: 'box-shadow ease 0.3s, background-color ease 0.2s',
                color: 'white',
                fontSize: fontSize + 'px',
                borderRadius: '0px'
            },
            unselectable = require('./ui/styles').unselectable;

        return <View id={'node' + this.props.id }
                     onTouchTap={() => this._onTap()}
                     style={outerStyle}>
            <View style={innerStyle}>
                <div style={unselectable}>{this.props.id}</div>
            </View>
        </View>;
    }
}


let [MEASURE, RENDER] = [0,1];
class DeployerGrid extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            step: MEASURE
        };
    }
    componentDidMount () {
        var listener = () => this.resize();
        this.setState({listener});
        window.addEventListener('resize', listener);
        this.resize();
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.state.listener);
    }
    resize () {
        var el = ReactDOM.findDOMNode(this);

        this.setState({
            step: RENDER,
            width: el.offsetWidth,
            height: el.offsetHeight
        });
    }
    render() {
        const NODE_NUMBER = 64,
            ROWS = 4,
            COLUMNS = NODE_NUMBER / ROWS,
            PADDING = 10;

        var style = {
            alignContent: 'flex-start',
            flexGrow: 1,
            height: 'auto',
            padding: PADDING + 'px',
            backgroundColor: '#80cbc4'
        };

        switch (this.state.step) {
            case MEASURE:
                return <View style={style}/>;
                break;
            case RENDER:
                var width = this.state.width - 2 * PADDING,
                    height = this.state.height - 2 * PADDING,
                    nW = width / COLUMNS,
                    nH = height / ROWS;

                var nodeSet = this.props.selectedNodes,
                    nodeList = _.range(1, NODE_NUMBER + 1)
                    .map((i) => <DeployerNode
                        key={i} id={i}
                        selected={nodeSet.contains(i)}
                        width={nW} height={nH} />);

                return <View id="grid" style={style}>{nodeList}</View>;
                break;
        }
    }
}

class GridWrapper extends React.Component {
    componentWillMount () {
        var listener = this._onChange.bind(this);
        DeployerStore.addChangeListener(listener);
        this.setState({listener});
        this._onChange();
    }

    componentWillUnmount () {
        DeployerStore.removeChangeListener(this.state.listener);
    }

    _onChange () {
        this.setState({
            selectedNodes: DeployerStore.getSelectedNodes()
        });
    }

    render () {
        return <DeployerGrid selectedNodes={this.state.selectedNodes} />
    }
}
module.exports = GridWrapper;
