const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore');

const NODE_PADDING = 3;
class DeployerNode extends React.Component {
    render () {
        var edge = Math.min(this.props.width, this.props.height) - 2 * NODE_PADDING;

        var outerStyle = {
                display: "flex",
                justifyContent: "center",
                width: edge + 'px',
                height: edge + 'px',
                padding: NODE_PADDING + 'px'
            },
            innerStyle = {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'darkgray',
                boxShadow: '0 0 3px black',
                color: 'white',
                fontSize: '30px',
                borderRadius: '0px'
            };
        return <View id={'node' + this.props.id } className="node" style={outerStyle}>
            <View style={innerStyle}>
                {this.props.id}
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
        console.log('yoooo');
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
            padding: PADDING + 'px'
        };

        switch (this.state.step) {
            case MEASURE:
                return <View/>;
                break;
            case RENDER:
                var width = this.state.width - 2 * PADDING,
                    height = this.state.height - 2 * PADDING,
                    nW = width / COLUMNS,
                    nH = height / ROWS;

                var nodeList = _.range(1, NODE_NUMBER + 1)
                    .map((i) => <DeployerNode
                        key={i} id={i}
                        width={nW} height={nH} />);

                return <View style={style}>{nodeList}</View>;
                break;
        }
    }
}
module.exports = DeployerGrid;
