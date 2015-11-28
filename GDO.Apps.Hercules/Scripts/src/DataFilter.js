const React = require('react'),
    FilterStore = require('stores/FilterStore'),
    _ = require('underscore'),
    {IndigoIterator, PurpleIterator} = require('colors');


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

class FilterPanel extends React.Component {
    static _getContainerStyle () {
        return {
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
        };
    }

    render () {
        return <div id="filter-panel" style={FilterPanel._getContainerStyle()}>
        </div>;
    }
}

class FieldList extends React.Component {
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

        console.log(fields.toArray(), fields);

        return <div style={FieldList._getContainerStyle()}>
            {fields.map(
                (f, i) =>
                    <Field {...f} key={i}
                                  listLength={fields.size}
                                  index={i}
                                  active={selectedIndex === i}
                                  handler={onFieldSelect(i)}
                                  backgroundColor={colorIter.getNext()}/> )}
        </div>;
    }
}

class DataFilter extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            selectedIndex: 0
        };
    }

    static _getContainerStyle () {
        return {
            display: 'flex',
            alignItems: 'stretch'
        };
    }

    _onSelect (index) {
        var fields = this.props.fields;
        if (index < fields.size)
            this.setState({selectedIndex: index});
    }

    render () {
        var {fields, filters} = this.props,
            {selectedIndex} = this.state,
            fieldList = fields.toList();

        return (
            <div style={DataFilter._getContainerStyle()}>
                <FieldList fields={fieldList}
                           selectedIndex={selectedIndex}
                           onSelect={this._onSelect.bind(this)}
                    />
                <FilterPanel field={null}/>
            </div>
        );
    }
}


class DataFilterWrapper extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            fields: FilterStore.getFields(),
            filters: FilterStore.getFilters()
        };
    }
    componentWillMount () {
        var listener = this._onChange.bind(this);

        FilterStore.addChangeListener(listener);

        this.setState({listener});
    }

    componentWillUnmount () {
        FilterStore.removeChangeListener(this.state.listener);
    }

    _onChange () {
        this.setState({
            fields: FilterStore.getFields(),
            filters: FilterStore.getFilters()
        });
    }

    render () {
        return <DataFilter {...this.state} />;
    }
}

DataFilterWrapper.prototype.tabName = 'Data Filter';

module.exports = DataFilterWrapper;
