const React = require('react'),
    GraphField = require('./GraphField'),
    AxisBox = require('./GraphAxisBox'),
    GraphBuilderStore = require('./stores/GraphBuilderStore');


class GraphBuilder extends React.Component {
    constructor(props) {
        super(props);

        var fields = [];
        for (var i=0; i<this.props.miniSet.fields.length; i++) {
            fields.push(this.props.miniSet.fields[i]);
        }

        this.state = {
            baseFields: fields,
            axes: []            //Use Immutable set?
        };
    }

    _onChange () {
        this.state.axes = [];
        var axesSet = GraphBuilderStore.getAxes(this.props.sectionId);
        var axesSetIter = axesSet.entries();
        var axis = axesSetIter.next();
        while (!axis.done) {
            this.state.axes.push(axis.value);
            axis = axesSetIter.next();
        }
    }

    componentDidMount () {
        var listener = this._onChange.bind(this);
        GraphBuilderStore.addChangeListener(listener);
        this.setState({listener});
        this._onChange();
    }

    componentWillUnmount () {
        GraphBuilderStore.removeChangeListener(this.state.listener);
    }

    render () {
        var fieldsBoxStyle = {
            border: 'solid',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            flexBasis: '250px'
        }, axisStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexBasis: '250px'
        }, builderStyle = {
            display: 'flex',
            flex: '1',
            flexDirection: 'row',
            alignSelf: 'stretch',
            justifyContent: 'space-around'
        }

        return <div id='buider' style={builderStyle}>
            <div id='fieldsBox' style={fieldsBoxStyle}>
                {this.state.baseFields.map(
                    f => <GraphField field={f} />
                )}
            </div>
            <div id='axes' style={axisStyle}>
                {this.state.axes.map(
                    axis => <AxisBox axisData={axis} sectionId={this.props.sectionId} />
                )}
            </div>
        </div>;
    }
}

module.exports = GraphBuilder;
