const React = require('react'),
    ReactDOM = require('react-dom'),
    FilterStore = require('stores/FilterStore'),
    _ = require('underscore'),
    {IndigoIterator, PurpleIterator} = require('colors'),
    Immutable = require('immutable'),
    SideMenu = require('ui/SideMenu'),
    RangeSelector = require('./RangeSelector'),
    MeasureComponent = require('ui/MeasureComponent');

class ApplyFilter extends React.Component {
    _getOuterStyle () {
        return {
            flex: '0 0 35px',
            padding: '10px 20px 10px 10px',
            display: 'flex',
            justifyContent: 'flex-end',
            boxShadow: '0 0 5px',
            alignItems: 'stretch',
            backgroundColor: '#00796B'
        };
    }

    _getButtonStyle () {
        return {
            flex: '0 0 100px',
            textTransform: 'uppercase',
            boxShadow: '0 0 10px gray',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '10px',
            color: 'white'
        };
    }

    render () {
        var buttonStyle = {
            flex: '0 0 100px',
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '20px',
            fontSize: 'small',
            color: 'white'
        }, cancelStyle = _.extend({}, buttonStyle, {
            boxShadow: '0 0 5px black',
            backgroundColor: '#607D8B'
        }), applyStyle = _.extend({}, buttonStyle, {
            boxShadow: '0 0 10px black',
            backgroundColor: '#F50057'
        }), {onApply, onCancel} = this.props;

        return <div style={this._getOuterStyle()}>
            <div style={cancelStyle} onTouchTap={onCancel}>
                Cancel
            </div>
            <div style={applyStyle} onTouchTap={onApply}>
                Apply
            </div>
        </div>;
    }
}

class FilterPanel extends React.Component {
    static _getContainerStyle () {
        return {
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            flexGrow: 1
        };
    }

    render () {
        var {field} = this.props;

        return <div id="filter-panel"
                    style={FilterPanel._getContainerStyle()}>
            <div style={{display: 'flex', flexGrow: 1, padding: '10px', alignItems: 'stretch'}}>
                <MeasureComponent getChildren={(props) => <RangeSelector {...props} field={field} />} />
            </div>
            <ApplyFilter onApply={() => {}} onCancel={() => {}} />
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
