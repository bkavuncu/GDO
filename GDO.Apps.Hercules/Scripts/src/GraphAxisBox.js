'use strict';
const React = require('react'),
     DropTarget = require('react-dnd').DropTarget,
     PropTypes = React.PropTypes;

const DragTypes = {
    FIELD: 'field'
};

const boxTarget = {
    drop(props, monitor) {
        //moveField(props.x, props.y);
        props.onDrop(monitor.getItem());
        console.log("DROPPED!");
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
            contents: []
        };
    }

    render () {
        const {isOver, canDrop, connectDropTarget} = this.props;
        const isActive = isOver && canDrop;

        if (isActive) {
            var axisBoxStyle = {
                border: 'dashed',
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch'
            }
        }else if (canDrop) {
            var axisBoxStyle = {
                border: 'solid',
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch'
            }
        } else {
            var axisBoxStyle = {
                display: 'flex',
                flex: '1',
                alignSelf: 'stretch'
            }
        }
        return connectDropTarget(
            <div className='axisBox' style={axisBoxStyle}> Bello! </div>
    );
    }
}

AxisBox.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    //accepts: PropTypes.arrayOf(PropTypes.string).isRequired,
    onDrop: PropTypes.func.isRequired

};

module.exports = DropTarget(DragTypes.FIELD, boxTarget, collect)(AxisBox);


