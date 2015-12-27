'use strict';
const React = require('react'),
    ReactDOM = require('react-dom');

let [MEASURE, RENDER] = [1,2];
class MeasureComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            step: MEASURE
        };
    }

    measure () {
        var el = ReactDOM.findDOMNode(this);

        this.setState({
            step: RENDER,
            width: el.offsetWidth,
            height: el.offsetHeight
        });
    }

    componentDidMount() {
        var listener = this.measure.bind(this);
        window.addEventListener('resize', listener);

        this.measure();
        this.setState({listener});
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.state.listener);
    }

    render () {
        var style = {
            flexGrow: 1,
            display: 'flex',
            alignItems: 'stretch',
            overflow: 'hidden'
        };

        if (this.state.step == MEASURE)
            return <div style={style} />;

        var {getChildren} = this.props,
            {width, height} = this.state;

        return <div style={style}>
            {getChildren({width, height})}
        </div>;
    }
}


module.exports = MeasureComponent;
