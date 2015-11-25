const React = require('react'),
    PropTypes = React.PropTypes,
    DragSource = require('react-dnd').DragSource;

const DragTypes = {
    FIELD: 'field'
};

var fieldSource = {
    beginDrag: function(props) {
        return props.field;
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class GraphField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render () {
        const { name, isDropped, isDragging, connectDragSource  } = this.props;
        return connectDragSource(
            <div style={{
            opacity: isDragging? 0.5 : 1,
            border: 'solid',
            fontSize: 25,
            fontWeight: 'bold',
            cursor: 'move',
            flexBasis: '100px'
            }}> {this.props.field.name}
            </div>
        );
    }
}

GraphField.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    field: PropTypes.object.isRequired,
    isDropped: PropTypes.bool.isRequired
};

module.exports = DragSource(DragTypes.FIELD, fieldSource, collect)(GraphField);
