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
            axes: [],            //Use Immutable set?
            empty: true
        };
    }

    _onChange () {
        this.state.axes = [];
        if (!GraphBuilderStore.isEmpty) {
            this.setState({
                empty: false
            });
            var axesSet = GraphBuilderStore.getAxes(this.props.sectionId);
            var axesSetIter = axesSet.entries();
            var axis = axesSetIter.next();

            while (!axis.done) {
                this.state.axes.push(axis.value);
                axis = axesSetIter.next();
            }
        } else {
            this.setState({
                empty: true
            });
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
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            alignItems: 'stretch',
            flexBasis: '500px',
            backgroundColor: '#9FE0DA',
            overflow: 'auto',
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
        }, wrapperStyle = {
            flexDirection: 'column',
            display: 'flex',
            flexBasis: '240px'
        }, titleStyle = {
            boxShadow: '0 0 4px black',
            backgroundColor: '#2196F3',
            padding: '5px',
            color: 'white'
        }, errorStyle = {
            alignSelf: 'center',
            fontSize: 'x-large',
            color: 'white'

        }, stopScroll = (e) => {
                e.stopPropagation();
        }

        if(this.state.empty) {
            return <div id='error' style={errorStyle}> Please assign a graph to your section! </div>;
        } else {
            return <div id='buider' onScroll={stopScroll} style={builderStyle}>
                <div id='fieldBoxWrapper' style={wrapperStyle}>
                    <div id="title" style={titleStyle}>
                        Available Fields
                    </div>
                    <div id='fieldsBox' style={fieldsBoxStyle}>
                        {this.state.baseFields.map(
                            (f, i) => <GraphField key={i} field={f} isRemovable={false}/>
                        )}
                    </div>
                </div>
                <div id='axes' style={axisStyle}>
                    {this.state.axes.map(
                            axis => {
                            var dimData = GraphBuilderStore.getDimensionData(axis[0]);
                            return <AxisBox key={axis[0]}
                                            axisData={axis}
                                            sectionId={this.props.sectionId}
                                            singleField={dimData.singleField}
                                            validTypes={dimData.validTypes}/>;
                        }
                    )}
                </div>
            </div>;
        }
    }
}

GraphBuilder.tabName = 'Graph Control';

module.exports = GraphBuilder;
