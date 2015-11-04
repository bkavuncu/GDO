'use strict';

var tabList = [
{ 'id': 1, 'name': 'Section Deployment', 'url': '/sectionDeployment' },
{ 'id': 2, 'name': 'Data Explorer', 'url': '/dataExplorer' },
{ 'id': 3, 'name': 'Data Enricher', 'url': '/dataEnricher' },
{ 'id': 4, 'name': 'Data Filter', 'url': '/dataFilter' },
{ 'id': 5, 'name': 'Graph Control', 'url': '/graphControl' }
];
var Tab = React.createClass({
    handleClick: function (e) {
        e.preventDefault();
        this.props.handleClick();
    },
    render: function () {
        return (
        <li className={this.props.isCurrent ? 'current' : null}>
    <a onClick={this.handleClick} href={this.props.url}>
        {this.props.name}
    </a>
        </li>
);
    }
});
var Tabs = React.createClass({
    handleClick: function (tab) {
        this.props.changeTab(tab);
    },
    render: function () {
        return (
        <nav>
        <ul>
            {this.props.tabList.map(function(tab) {
            return (
            <Tab handleClick={this.handleClick.bind(this, tab)}
                 key={tab.id}
                 url={tab.url}
                 name={tab.name}
                 isCurrent={(this.props.currentTab === tab.id)} />
            );
            }.bind(this))}
        </ul>
        </nav>
);
    }
});
var Content = React.createClass({
    render: function () {
        return (
        <div className="content">
            {this.props.currentTab === 1 ?
        <div>
            Section Deployer!
        </div>
            :null}
            {this.props.currentTab === 2 ?
<div>
    Data Explorer!
</div>
            :null}
            {this.props.currentTab === 3 ?
<div>
    Data Enricher!
</div>
            :null}
            {this.props.currentTab === 4 ?
<div>
    Data Filter!
</div>
            :null}
            {this.props.currentTab === 5 ?
<div>
    Graph Control!
</div>
            :null}
        </div>
);
    }
});
var App = React.createClass({
    getInitialState: function () {
        return {
            tabList: tabList,
            currentTab: 1
        };
    },
    changeTab: function (tab) {
        this.setState({ currentTab: tab.id });
    },
    render: function () {
        return (
        <div>
        <Tabs currentTab={this.state.currentTab}
              tabList={this.state.tabList}
              changeTab={this.changeTab} />
<Content currentTab={this.state.currentTab} />
        </div>
);
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
        console.log('This State', this.state);
        if (this.state.fullscreen)
            return <App />;
        else
            return <GoFullscreen />;
    }
}

React.render(
<Start />,
document.getElementById("react-target")
);