const React = require('react'),
    buttonStyle = {
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'center',
        fontSize: '24px',
        color: 'rgba(0,0,0, 0.6)',
        alignItems: 'center'
    };

let [REST, TAP, PRESS, HOLD] = [1,2,3,4];
class Button extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            step: REST
        };
    }

    _getOuterStyle () {
        return buttonStyle;
    }

    _action () {
        this.props.handler();
    }

    _tapToPress () {
        var interval = setInterval(this._action.bind(this), 300),
            timeout = setTimeout(this._pressToHold.bind(this), 1500);

        this.setState({
            step: PRESS,
            interval: interval,
            timeout: timeout
        });
    }

    _pressToHold () {
        clearInterval(this.state.interval);

        var interval = setInterval(this._action.bind(this), 80);

        this.setState({
            step: HOLD,
            interval: interval
        });
    }

    _restToTap () {
        var timeout = setTimeout(this._tapToPress.bind(this), 300);
        this.setState({
            timeout: timeout,
            step: TAP
        });
    }

    _onDown () {
        var {step} = this.state;

        if (step === REST) {
            this._restToTap();
        }
    }

    _onUp () {
        var {step, interval, timeout} = this.state,
            {onDone} = this.props;

        clearInterval(interval);
        clearTimeout(timeout);

        if (step === TAP) {
            this._action();
        }

        if (step !== REST) {
            this.setState({step: REST});
            onDone();
        }
    }

    _onCancel (e) {
        this._onUp(e);
    }

    render () {
        var {value} = this.props,
            valString = value > 0? '+' + value : value,
            start = this._onDown.bind(this),
            end = this._onUp.bind(this),
            cancel = this._onCancel.bind(this);

        return <div style={this._getOuterStyle()}
                    onTouchStart={start}
                    onMouseDown={start}
                    onTouchCancel={cancel}
                    onMouseLeave={cancel}
                    onMouseUp={end}
                    onTouchEnd={end}>
            {valString}
        </div>;
    }
}

module.exports = Button;
