const React = require('react'),
    ReactDOM = require('react-dom'),
    FilterStore = require('stores/FilterStore'),
    _ = require('underscore'),
    {IndigoIterator, PurpleIterator} = require('colors'),
    Immutable = require('immutable'),
    SideMenu = require('ui/SideMenu'),
    RangeSelector = require('./RangeSelector'),
    MeasureComponent = require('ui/MeasureComponent');

class FilterPanel extends React.Component {
    static _getContainerStyle () {
        return {
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            padding: '15px'
        };
    }

    render () {
        var {field} = this.props;

        return <div id="filter-panel"
                    style={FilterPanel._getContainerStyle()}>
            <MeasureComponent getChildren={(props) => <RangeSelector {...props} field={field} />} />
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
            alignItems: 'stretch',
            flexGrow: 1
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
            fieldLabelList = fields.keySeq().toArray(),
            selectedField = fields.get(fieldLabelList[selectedIndex]);

        return (
            <div style={DataFilter._getContainerStyle()}>
                <SideMenu fields={fieldLabelList}
                           selectedIndex={selectedIndex}
                           onSelect={this._onSelect.bind(this)}
                    />
                <FilterPanel field={selectedField}/>
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
