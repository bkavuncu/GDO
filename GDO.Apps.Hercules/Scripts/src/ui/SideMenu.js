const React = require('react'),
    _ = require('underscore'),
    {IndigoIterator, PurpleIterator} = require('./Colors');


class Field extends React.Component {
    _getZIndex () {
        var {active, listLength, index} = this.props;

        return active? listLength + 1 : listLength - index;
    }

    _getFlexBasis () {
        var {hover} = this.state,
            {active} = this.props;

        return hover? '85%' : (active? '100%' : '80%');
    }

    _getOuterStyle () {
        return {
            display: 'flex',
            justifyContent: 'flex-start',
            zIndex: this._getZIndex(),
            flexBasis: '50px'
        };
    }

    _getInnerStyle () {
        var {active, backgroundColor} = this.props,
            finalColor = active? '#2196F3' : backgroundColor;

        return {
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexBasis: this._getFlexBasis(),
            paddingLeft: '10px',
            color: 'white',
            boxShadow: '0 0 3px black',
            zIndex: this._getZIndex(),
            backgroundColor: finalColor,
            transition: 'flex-basis ease-in-out 0.3s'
        };
    }

    constructor (props) {
        super (props);

        this.state = {
            hover: false
        };
    }

    render () {
        var {handler, name, active} = this.props,
            outerStyle = this._getOuterStyle(),
            innerStyle = this._getInnerStyle(),
            newHandler = () => {
                this.setState({hover: false});
                handler();
            };

        return (
            <div style={outerStyle}>
                <div style={innerStyle}
                     onMouseEnter={() => this.setState({hover: !active && true})}
                     onMouseLeave={() => this.setState({hover: false})}
                     onTouchTap={newHandler}>
                    {name}
                </div>
            </div>
        );
    }
}

class SideMenu extends React.Component {
    static _getContainerStyle () {
        return {
            flex: '0 0 200px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 5px gray',
            backgroundColor: '#607D8B',
            alignItems: 'stretch'
        };
    }

    render () {
        var {fields, onSelect, selectedIndex} = this.props,
            colorIter = IndigoIterator(),
            onFieldSelect = (fieldIndex) => {
                return () => onSelect(fieldIndex);
            };

        return <div style={SideMenu._getContainerStyle()}>
            {fields.map(
                (f, i) =>
                    <Field    key={i}
                              name={f}
                              listLength={fields.length}
                              index={i}
                              active={selectedIndex === i}
                              handler={onFieldSelect(i)}
                              backgroundColor={colorIter.getNext()}/> )}
        </div>;
    }
}


module.exports = SideMenu;
