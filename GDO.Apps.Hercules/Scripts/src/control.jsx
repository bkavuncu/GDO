'use strict';
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');

class DeployerNode extends React.Component {
    render () {
        var w = this.props.width,
            h = this.props.height;
        var nodeStyle = {
            display: "flex",
            justifyItems: "center",
            width: w + 'px',
            height: h + 'px'
        };
        return <div id={'node' + this.props.id } className="node" style={nodeStyle}>
            {this.props.id}
        </div>;
    }
}

let [MEASURE, RENDER] = [0,1];
class DeployerGrid extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            step: MEASURE
        };
    }
    componentDidMount () {
        var el = ReactDOM.findDOMNode(this);

        this.setState({
            step: RENDER,
            width: el.offsetWidth,
            height: el.offsetHeight
        });
    }
    render() {
        const NODE_NUMBER = 64,
            ROWS = 4, COLUMNS = NODE_NUMBER / ROWS;

        switch (this.state.step) {
            case MEASURE:
                var containerStyle = {
                    width: '100%',
                    height: '100%'
                };

                return <div style={containerStyle} />;
                break;
            case RENDER:
                var nW = this.state.width / ROWS,
                    nH = this.state.height / COLUMNS;
                var nodeList = _.range(64).map((i) => <DeployerNode key={i} id={i} width={nW} height={nH} />);

                var containerStyle = {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexWrap: 'wrap'
                };

                return <div style={containerStyle}>{nodeList}</div>;
                break;
        }
    }
}

var SectionDeployer = React.createClass({
    render: function () {
        return <div>
        <div> Dis da section deployer </div>
        <DeployerGrid />
    </div>;
    }
});

var tabList = [
{ 'id': 1, 'name': 'Section Deployment', 'url': '/sectionDeployment' },
{ 'id': 2, 'name': 'Data Explorer', 'url': '/dataExplorer' },
{ 'id': 3, 'name': 'Data Enricher', 'url': '/dataEnricher' },
{ 'id': 4, 'name': 'Data Filter', 'url': '/dataFilter' },
{ 'id': 5, 'name': 'Graph Control boiiii!', 'url': '/graphControl' }
];
var Tab = React.createClass({
    handleClick: function (e) {
        e.preventDefault();
        this.props.handleClick();
    },

    render: function () {
        return (
        <li className={this.props.isCurrent ? 'current' : null} >
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
                 isCurrent={(this.props.currentTab === tab.id)}/>
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
            <SectionDeployer />
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
        console.log('his State', this.state);
        if (this.state.fullscreen)
            return <App />;
        else
            return <GoFullscreen />;
    }
}

ReactDOM.render(
<Start />,
document.getElementById("react-target")
);