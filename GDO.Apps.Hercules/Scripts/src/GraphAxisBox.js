'use strict';
const React = require('react'),
     DropTarget = require('react-dnd').DropTarget,
     PropTypes = React.PropTypes,
     GraphField = require('./GraphField'),
     Builder = require('./actions/GraphBuilderActions'),
     GraphBuilderStore = require('./stores/GraphBuilderStore');

const DragTypes = {
    FIELD: 'field'
};

const boxTarget = {
    drop(props, monitor, component) {
        if ((props.singleField && component.getNumEntries() < 1) || !props.singleField ) {
            var type = monitor.getItem().type;
            var validTypes = props.validTypes;
            for(var vType in validTypes) {
                if (validTypes[vType] == type) {
                    Builder.addField(monitor.getItem(), props.axisData[0]);
                } else {
                    //Wrong type error
                }
            }
        } else {
            //Too many fields error
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

class AxisBox extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            name: this.props.axisData[0],
            contents: []
        };
    }

    getNumEntries() {
        return this.state.contents.length;
    }

    _onChange () {
        this.state.contents = [];
        var axesSet = GraphBuilderStore.getAxes(this.props.sectionId);
        var axisFields = axesSet.get(this.state.name);
        var axisFieldIter = axisFields.values();
        var field = axisFieldIter.next();
        while (!field.done) {
            this.state.contents.push(field.value);
            field = axisFieldIter.next();
        }


        var fieldIter = this.props.axisData[1].entries();
        var field = fieldIter.next();
        while (!field.done) {
            this.state.contents.push(field.value);
            field = fieldIter.next();
        }

    }

    _onRemove (field) {
        Builder.removeField(field, this.props.axisData[0]);
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
        const {isOver, canDrop, connectDropTarget} = this.props;
        const isActive = isOver && canDrop;

        if (isActive) {
            var axisBoxStyle = {
                border: 'dashed',
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: '#9FE0DA'
            }
        }else if (canDrop) {
            var axisBoxStyle = {
                border: 'solid',
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: '#9FE0DA'
            }
        } else {
            var axisBoxStyle = {
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: '#9FE0DA'
            }
        }
        return connectDropTarget(
            <div id='axisBox' style={axisBoxStyle}>
                {this.state.name}
                {this.state.contents.map(
                    f=> <GraphField key={f.name} field={f} isRemovable={true} remove={this._onRemove.bind(this)} />
                )}
            </div>
    );
    }
}

AxisBox.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    sectionId: PropTypes.number.isRequired,
    canDrop: PropTypes.bool.isRequired,
    singleField: PropTypes.bool.isRequired,
    validTypes: PropTypes.array.isRequired
};

module.exports = DropTarget(DragTypes.FIELD, boxTarget, collect)(AxisBox);


