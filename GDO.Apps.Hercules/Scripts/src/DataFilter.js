const React = require('react');


const fieldStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '50px'
}, Field = (field) => {
    return (
        <div style={fieldStyle}>
            {field.name}
        </div>
    );
};

class FieldList extends React.Component () {
    render () {
        return <div style={style}>
            {this.props.fields.map(Field)}
        </div>;
    }
}

class DataFilter extends React.Component {

    render () {
        return (
            <div style={outerStyle}>
                <FieldList />
                <FilterPanel />
            </div>
        );
    }
}


export default class DataFilterWrapper extends React.Component {
    componentWillMount () {

    }
    render () {
        return <DataFilter fields={this.state.fields} />;
    }
}
