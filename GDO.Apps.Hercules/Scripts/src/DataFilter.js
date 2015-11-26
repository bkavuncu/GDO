const React = require('react'),
    DatasetStore = require('stores/DatasetStore'),
    _ = require('underscore');


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

const colors = ['#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E'],
    pickColor = (index) => {
        var l = colors.length - 1,
            evenCycle = (Math.floor(index / l) % 2) === 0,
            selector = (index % l) + 1;

        if (evenCycle)
            return colors[selector];
        else
            return colors[l - selector];
    };

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
            onFieldSelect = (fieldIndex) => {
                return () => onSelect(fieldIndex);
            };

        return <div style={FieldList._getContainerStyle()}>
            {fields.map(
                (f, i) =>
                    <Field {...f} key={i}
                                  listLength={fields.length}
                                  index={i}
                                  active={selectedIndex === i}
                                  handler={onFieldSelect(i)}
                                  backgroundColor={pickColor(i)}/> )}
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
        var fields = this.props.miniset.fields;
        if (index < fields.length)
            this.setState({selectedIndex: index});
    }

    render () {
        var {miniset} = this.props,
            {selectedIndex} = this.state;

        return (
            <div style={DataFilter._getContainerStyle()}>
                <FieldList fields={miniset.fields}
                           selectedIndex={selectedIndex}
                           onSelect={this._onSelect.bind(this)}
                    />
                <FilterPanel field={miniset[selectedIndex]}/>
            </div>
        );
    }
}


class DataFilterWrapper extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            datasetId: DatasetStore.getActiveDatasetId()
        };
    }
    componentWillMount () {
        var listener = this._onChange.bind(this);

        DatasetStore.addChangeListener(listener);

        this.setState({listener});
    }

    componentWillUnmount () {
        DatasetStore.removeChangeListener(this.state.listener);
    }

    _onChange () {
        this.setState({
            datasetId: DatasetStore.getActiveDatasetId()
        });
    }

    render () {
        var miniset = DatasetStore.getMiniSet(this.state.datasetId);

        return <DataFilter miniset={miniset} />;
    }
}

DataFilterWrapper.prototype.tabName = 'Data Filter';

module.exports = DataFilterWrapper;
