const React = require('react'),
    _ = require('underscore');

const initialStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
};

class View extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            style: _.extend({}, initialStyle, this.props.style)
        };
    }

    render () {
        var newStyle = _.extend({}, this.state.style, this.props.style),
            // pass all props down except style
            other = _.omit(this.props, 'style');

        return <div style={newStyle} {...other}>
            {this.props.children}
        </div>;
    }
}

module.exports = View;
