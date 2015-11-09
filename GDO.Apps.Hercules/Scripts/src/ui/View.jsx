const React = require('react');
const _ = require('underscore');

const initialStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyElements: 'center'
};

class View extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            style: initialStyle
        };

        if (props.style) {
            this.mergeStyle(props.style);
        }
    }

    componentWIllReceiveProps (props) {
        if (props.style) {
            this.mergeStyle(props.style);
        }
    }

    mergeStyle(newStyle) {
        this.setState({
            style: _.extend(this.state.style, newStyle)
        });
    }

    render () {
        return <div style={this.state.style}>
            {this.props.children}    
        </div>;    
    }
}

module.exports = View;