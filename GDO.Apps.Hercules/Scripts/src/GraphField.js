const React = require('react'),
    PropTypes = React.PropTypes,
    DragSource = require('react-dnd').DragSource;

const DragTypes = {
    FIELD: 'field'
};

var fieldSource = {
    beginDrag: function(props) {
        return {
            name: props.name
        };
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
            //cursor: 'move',
            flexBasis: '60px'
            }}> Drag meh!
            </div>
        );
    }
}

GraphField.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isDropped: PropTypes.bool.isRequired
};

module.exports = DragSource(DragTypes.FIELD, fieldSource, collect)(GraphField);
