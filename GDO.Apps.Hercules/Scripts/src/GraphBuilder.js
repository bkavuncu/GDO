const React = require('react'),
    GraphField = require('./GraphField'),
    AxisBox = require('./GraphAxisBox');


class GraphBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    render () {
        var fieldsBoxStyle = {
            border: 'solid',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            flexBasis: '250px'
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
        }

        return <div className='buider' style={builderStyle}>
            <div className='fieldsBox' style={fieldsBoxStyle}>
                <GraphField/>
            </div>
            <div className='axes' style={axisStyle}>
                <AxisBox />
                <AxisBox />
            </div>
        </div>;
    }
}

module.exports = GraphBuilder;
