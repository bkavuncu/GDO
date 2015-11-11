'use strict';
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');

var View = require('./ui/View.jsx'),
    Tabs = require('./Tabs.jsx');

require('react-tap-event-plugin')();

var App = React.createClass({
    render: function () {
        return <View>
            <Tabs />
        </View>;
    }
});

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

class GoFullscreen extends React.Component {
    render() {
        var containerStyle = {
            display: "flex",
            justifyItems: "center"
        },
            buttonStyle = {
                padding: "100px",
                boxShadow: "0 0 10px gray"
        };

        return <div style={containerStyle}>
            <div onClick={this.onClick} style={buttonStyle}>
                Launch Apollo
            </div>
        </div>;
    }
    onClick() {
        var win = window.open(window.location.href + '&fullscreen=true', '_blank');
        win.focus();
    }
}

class Start extends React.Component {
    constructor(props) {
        super(props);
        var params = getQueryParams(window.location.search);
        console.log('Hello World', params);

        if (params.fullscreen)
            this.state = { fullscreen: true };
        else
            this.state = {};
    }

    render() {
        console.log('his State', this.state);
        if (this.state.fullscreen)
            return <App />;
        else
            return <GoFullscreen />;
    }
}

ReactDOM.render(
<App />,
document.getElementById("react-target")
);
