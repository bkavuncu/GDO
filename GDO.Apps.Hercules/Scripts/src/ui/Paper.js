const React = require('react'),
    _ = require('underscore'),
    W_PAPER = 210,
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

module.exports = Paper;
