const React = require('react'),
    DatasetStore = require('stores/DatasetStore');


const Field = (props) => {
    var zIndex = props.listLength - props.index,
        fieldStyle = {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexBasis: '30px',
        padding: '10px',
        color: 'white',
        boxShadow: '0 0 3px black',
        zIndex: zIndex,
        backgroundColor: props.backgroundColor
    };

    return (
        <div style={fieldStyle}>
            {props.name}
        </div>
    );
};

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
            alignItems: 'stretch',
            boxShadow: '0 0 5px gray',
            backgroundColor: '#607D8B'
        };
    }

    render () {
        var {fields} = this.props;

        return <div style={FieldList._getContainerStyle()}>
            {fields.map(
                (f, i) =>
                    <Field {...f} key={i}
                                  listLength={fields.length}
                                  index={i}
                                  backgroundColor={pickColor(i)}/>)}
        </div>;
    }
}

class DataFilter extends React.Component {
    static _getContainerStyle () {
        return {
            display: 'flex',
            alignItems: 'stretch'
        };
    }

    render () {
        var {miniset} = this.props;

        return (
            <div style={DataFilter._getContainerStyle()}>
                <FieldList fields={miniset.fields}/>
                <FilterPanel />
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
