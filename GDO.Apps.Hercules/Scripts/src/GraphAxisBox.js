'use strict';
const React = require('react'),
     DropTarget = require('react-dnd').DropTarget,
     PropTypes = React.PropTypes,
     GraphField = require('./GraphField'),
     Builder = require('actions/GraphBuilderActions'),
     GraphBuilderStore = require('stores/GraphBuilderStore'),
     Immutable = require('immutable'),
     _ = require('underscore');

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
            contents: Immutable.List()
        };
    }

    getNumEntries() {
        return this.state.contents.size;
    }

    _onChange () {
        this.state.contents = this.state.contents.clear();
        var axesSet = GraphBuilderStore.getAxes(this.props.sectionId);
        var axisFields = axesSet.get(this.state.name);
        if (axisFields !== null) {
            var axisFieldIter = axisFields.values();
            var field = axisFieldIter.next();
            var fieldIndex = 0;
            while (!field.done) {
                this.state.contents = this.state.contents.set(fieldIndex, field.value);
                field = axisFieldIter.next();
                fieldIndex++;
            }

            var fieldIter = this.props.axisData[1].entries();
            var field = fieldIter.next();
            while (!field.done) {
                this.state.contents.push(field.value);
                field = fieldIter.next();
            }
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

        var titleStyle = {
            boxShadow: '0 0 4px black',
            backgroundColor: '#2196F3',
            padding: '5px',
            color: 'white'
        }

        if (isActive) {
            var axisBoxStyle = {
                margin: '5px',
                boxShadow: '0 0 10px black',
                display: 'flex',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: '#9FE0DA'
            }
        }else if (canDrop) {
            var axisBoxStyle = {
                margin: '5px',
                boxShadow: '0 0 3px black',
                display: 'flex',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: '#9FE0DA'
            }
        } else {
            var axisBoxStyle = {
                margin: '5px',
                display: 'flex',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: '#9FE0DA'
            }
        }

        if(this.props.singleField) {
            var sizeStyle = {
                flexBasis: '150px'
            }
        } else {
            var sizeStyle = {
                flex: 1
            }
        }

        axisBoxStyle = _.extend({}, axisBoxStyle, sizeStyle);

        return connectDropTarget(
            <div id='axisBox' style={axisBoxStyle}>
                <div id="title" style={titleStyle}>
                    {this.state.name}
                </div>
                {this.state.contents.map(
                    (f, i) => <GraphField field={f} isRemovable={true} remove={this._onRemove.bind(this)}/>
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


