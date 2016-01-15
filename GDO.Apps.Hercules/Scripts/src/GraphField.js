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

    _onRemove () {
        this.props.remove(this.props.field);
    }

    render () {
        const { name, isDropped, isDragging, connectDragSource  } = this.props;
        var fieldStyle = {
            opacity: isDragging? 0.5 : 1,
            border: 'solid rgb(41, 41, 41) 2px',
            fontSize: 25,
            fontWeight: 'bold',
            cursor: 'move',
            display: 'flex',
            flexDirection: 'row',
            flexBasis: '100px',
            padding: '7px'

        }, closeStyle = {

        }, nameStyle = {
            flexGrow: '1'
        }

        return connectDragSource(
            <div style={fieldStyle}>
                <div style={nameStyle}>
                    {this.props.field.name}
                </div>
                {this.props.isRemovable ?
                    <div style={closeStyle} onClick={this._onRemove.bind(this)}> X </div> :
                <div/>}
            </div>
        );
    }
}

GraphField.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    field: PropTypes.object.isRequired,
    isRemovable: PropTypes.bool.isRequired,
    remove: PropTypes.func
};

module.exports = DragSource(DragTypes.FIELD, fieldSource, collect)(GraphField);
