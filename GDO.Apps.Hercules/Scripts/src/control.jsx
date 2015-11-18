'use strict';
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom'),
    NavStore = require('./stores/NavStore');

var View = require('./ui/View.jsx'),
    Tabs = require('./Tabs.jsx'),
    Importer = require('./Importer');

require('react-tap-event-plugin')();

class App  extends React.Component {
    componentWillMount () {
        var listener = this._onRouteChange.bind(this),
            route = NavStore.getRoute();
        NavStore.addChangeListener(listener);
        this.setState({listener, route});
    }

    _onRouteChange () {
        var route = NavStore.getRoute();
        this.setState({route});
    }

    componentWillUnmount () {
        NavStore.removeChangeListener(this.state.listener);
    }

    render () {
        switch (this.state.route) {
            case 'VIEW':
                return <View>
                    <Tabs />
                </View>;
            case 'CREATE':
                return <View>
                    <Importer />
                </View>;
        }
    }
}

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
