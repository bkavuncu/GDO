const React = require('react'),
    _ = require('underscore'),
    {IndigoIterator, PurpleIterator} = require('./Colors');


class Field extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            hover: false
        };
    }
    render () {
        var {handler, backgroundColor, name, listLength, active, index} = this.props,
            {hover} = this.state,
            zIndex = listLength - index,
            outerStyle = {
                display: 'flex',
                justifyContent: 'flex-start',
                zIndex: zIndex,
                flexBasis: '50px'
            },
            innerStyle = {
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexBasis: hover? '85%' : (active? '100%' : '80%'),
                paddingLeft: '10px',
                color: 'white',
                boxShadow: '0 0 3px black',
                zIndex: zIndex,
                backgroundColor: backgroundColor,
                transition: 'flex-basis ease-in-out 0.3s'
            }, newHandler = () => {
                this.setState({hover: false});
                handler();
            };

        if (active) {
            var moreStyle = {
                backgroundColor: '#2196F3',
                zIndex: listLength + 1
            };

            innerStyle = _.extend({}, innerStyle, moreStyle);
        }

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
                              listLength={fields.size}
                              index={i}
                              active={selectedIndex === i}
                              handler={onFieldSelect(i)}
                              backgroundColor={colorIter.getNext()}/> )}
        </div>;
    }
}


module.exports = SideMenu;
