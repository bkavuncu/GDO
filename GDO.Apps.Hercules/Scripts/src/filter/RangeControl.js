const React = require('react'),
    _ = require('underscore'),
    {IndigoIterator} = require('ui/Colors'),
    Button = require('./ThrottleButton');

const buttonStyle = {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    fontSize: '24px',
    color: 'rgba(0,0,0, 0.6)',
    alignItems: 'center'
};

class ControlBar extends React.Component {
    _getOuterStyle () {
        return {
            display: 'flex',
            alignItems: 'stretch',
            alignSelf: 'stretch',
            flex: '0 1 100px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 10px gray',
            zIndex: '100'
        }
    }

    _getValueStyle () {
        return _.extend({}, buttonStyle, {
            flexGrow: 2,
            fontSize: '42px',
            boxShadow: 'inset 0 0 10px gray'
        })
    }

    _getHandler (val) {
        var {onDelta} = this.props;

        return () => {
            onDelta(val);
        };
    }

    render () {
        var {value, onDone} = this.props,
            getButton = (val, i) => {
                return <Button key={i} value={val}
                               handler={this._getHandler(val)} onDone={onDone}/>;
            }, left = [-10, -1].map(getButton),
            right = [1,10].map(getButton);

        return <div style={this._getOuterStyle()}>
            {left}
            <div style={this._getValueStyle()}>
                {value}
            </div>
            {right}
        </div>;
    }
}

const StatFieldRow = ({name, value, color, zIndex}) => {
    var style = {
        flex: '0 0 30px',
        display: 'flex',
        color: 'white',
        padding: '15px 0 10px 0',
        overflow: 'hidden',
        alignItems: 'baseline',
        backgroundColor: color,
        zIndex: zIndex,
        boxShadow: '0 0 5px black'
    }, leftStyle = {
        flex: '0 0 50%',
        textAlign: 'right',
        paddingRight: '5px',
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.8)'
    }, rightStyle = {
        textAlign: 'left',
        flex: '0 0 50%',
        fontSize: '20px',
        paddingLeft: '5px'
    };

    return <div key={name} style={style}>
        <div style={leftStyle}>
            {name}
        </div>
        <div style={rightStyle}>
            {value}
        </div>
    </div>;
};

class StatViewer extends React.Component {
    _getOuterStyle () {
        return {
            flexGrow: 2,
            display: 'flex',
            alignItems: 'stretch'
        }
    }

    _getColumnStyle () {
        return {
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            alignItems: 'stretch',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        }
    }

    render () {
        var {field} = this.props,
            stats = field.stats,
            keys = Object.keys(stats),
            l = keys.length,
            iter = new IndigoIterator();

        return <div style={this._getOuterStyle()}>
            <div style={this._getColumnStyle()}>
                {keys.map((k, i) => <StatFieldRow key={k} zIndex={l-i} name={k} value={stats[k]} color={iter.getNext()}/>)}
            </div>
        </div>;
    }
}

class RangeControl extends React.Component {
    _getOuterStyle () {
        return {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            flexGrow: 1,
            padding: '0 10px 0 10px'
        };
    }

    render () {
        var {min, max, field, onUpdateMin, onUpdateMax, onDone} = this.props,
            deltaMin = (delta) => {
                onUpdateMin(min + delta);
            }, deltaMax = (delta) => {
                onUpdateMax(max + delta);
            };

        return <div style={this._getOuterStyle()}>
            <ControlBar value={min} onDelta={deltaMin} {...{onDone}}/>
            <StatViewer field={field} />
            <ControlBar value={max} onDelta={deltaMax} {...{onDone}}/>
        </div>;
    }
}

module.exports = RangeControl;
