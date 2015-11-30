const React = require('react'),
    FilterStore = require('stores/FilterStore'),
    _ = require('underscore'),
    {IndigoIterator, PurpleIterator} = require('colors'),
    Immutable = require('immutable'),
    SideMenu = require('./ui/SideMenu');

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
            fieldList = fields.toList(),
            fieldLabelList = [];

        var fieldListIter = fieldList.entries(),
            field = fieldListIter.next();

        while(!field.done) {
            fieldLabelList.push(field.value[1].name);
            field = fieldListIter.next();
        }

        return (
            <div style={DataFilter._getContainerStyle()}>
                <SideMenu fields={fieldLabelList}
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
