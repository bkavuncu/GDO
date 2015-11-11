'use strict';
const React = require('react'),
    View = require('./ui/View.jsx'),
    ReactDOM = require('react-dom'),
    _ = require('underscore');

const W_PAPER = 200,
    H_PAPER = 300,
    P_PAPER = 5;

class Paper extends React.Component {
    render () {
        var outerStyle = {
                padding: '5px'
            },
            innerStyle = {
                width: W_PAPER + 'px',
                height: H_PAPER + 'px',
                boxShadow: '0 0 10px gray',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: P_PAPER + 'px',
                color: 'gray',
                justifyContent: 'center'
            },
            otherProps = _.omit(this.props, 'style');

        return <div style={outerStyle} {...otherProps}>
            <div style={innerStyle}>
                {this.props.children}
            </div>
        </div>;
    }
}

var datasets = [
    {
        name: 'George Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                type: 'enum'
            },{
                name: 'orange',
                type: 'number'
            }
        ]
    },{
        name: 'Sam Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                type: 'enum'
            },{
                name: 'orange',
                type: 'number'
            }
        ]
    },{
        name: 'Gina Lemon',
        description: 'a family friend',
        fields: [
            {
                name: 'lemon',
                type: 'enum'
            },{
                name: 'orange',
                type: 'number'
            }
        ]
    }
];

class AddNew extends React.Component {
    render () {
        return <Paper>
            <div><i className="material-icons md-48">add_circle_outline</i></div>
            <div>Add New</div>
        </Paper>;
    }
}

class Dataset extends React.Component {
    render () {
        var d = this.props.data,
            nameStyle = {
                fontSize: '24px',
                paddingBottom: '5px',
                color: 'black'
            },
            separator = {
                marginTop: '15px',
                marginBottom: '15px',
                width: '100px',
                borderTop: '1px solid gray'
            },
            fieldStyle = {
                borderRadius: '2px',
                padding: '4px',
                border: '1px solid gray'
            };

        return <Paper>
            <div style={nameStyle}>{d.name}</div>
            <div>{d.description}</div>
            <div style={separator} />
            <div style={fieldStyle}>{d.fields.length} fields</div>
        </Paper>;
    }
}

class Explorer extends React.Component {
    render () {
        var outerStyle = {
            backgroundColor: 'beige',
            alignContent: 'flex-start',
            flexGrow: 1,
            height: 'auto',
            padding: '5px'
        };

        return <View style={outerStyle}>
            <AddNew />
            {datasets.map((d) => <Dataset key={d.name} data={d} />)}
        </View>;
    }
}

module.exports = Explorer;
