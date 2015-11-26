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
    drop(props, monitor) {
        Builder.addField(props.sectionId, monitor.getItem(), props.axisData[0]);
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

    _onChange () {
        //console.log(this.props.axisData[1].size);
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
        //for (var field in this.props.axisData[1]) {
        //    this.state.contents.push(field);
        //}
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
                overflow: 'auto'
            }
        }else if (canDrop) {
            var axisBoxStyle = {
                border: 'solid',
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto'
            }
        } else {
            var axisBoxStyle = {
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch',
                flexDirection: 'column',
                overflow: 'auto'
            }
        }
        return connectDropTarget(
            <div id='axisBox' style={axisBoxStyle}>
                {this.state.name}
                {this.state.contents.map(
                    f=> <GraphField field={f} />
                )}
            </div>
    );
    }
}

AxisBox.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    sectionId: PropTypes.number.isRequired
    //accepts: PropTypes.arrayOf(PropTypes.string).isRequired,

};

module.exports = DropTarget(DragTypes.FIELD, boxTarget, collect)(AxisBox);


