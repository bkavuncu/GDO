'use strict';
const React = require('react'),
    View = require('./ui/View.jsx'),
    _ = require('underscore'),
    screenfull = require('screenfull'),
    DragDropContext = require('react-dnd').DragDropContext;


var DeployerGrid = require('./DeployerGrid.js'),
    DataExplorer = require('./Explorer'),
    GraphControl = require('./GraphControl'),
    DataEnricher, DataFilter;

class Tab extends React.Component {
    render () {
        var name = this.props.name,
            color = this.props.active? '#80cbc4' : '#009688',
            tabStyle = {
                flexGrow: 1,
                width: 'auto',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: color,
                transition: 'background-color ease-in 0.2s'
            },
            handler = () => this.props.handleClick(name);

        return (
            <View style={tabStyle} onTouchTap={handler}>
                {name}
            </View>
        );
    }
}

class FullscreenToggle extends React.Component {
    constructor () {
        super();

        this.state = {
            active: false,
            iconName: 'fullscreen',
            enabled: screenfull.enabled
        };
    }
    _toggle () {
        if (!this.state.active) {
            screenfull.request();
            console.log('yooooooo');
            this.setState({
                active: true,
                iconName: 'fullscreen_exit'
            })
        } else {
            screenfull.exit();
            this.setState({
                active: false,
                iconName: 'fullscreen'
            })
        }
    }

    render () {
        if (!this.state.enabled)
            return <span />;

        var handler = this._toggle.bind(this),
            style = {
                backgroundColor: '#009688',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: '0 0 30px'
            };

        return <View style={style} onTouchTap={handler}>
            <i className="material-icons">{this.state.iconName}</i>
        </View>;
    }
}

let TABS = {
    "Section Deployment": DeployerGrid,
    "Data Explorer": DataExplorer,
    "Data Enricher": DataEnricher,
    "Data Filter": DataFilter,
    "Graph Control": GraphControl
};

class Tabs extends React.Component {
    constructor () {
        super();

        this.state = {
            active: "Section Deployment"
        };
    }

    render () {
        var activeTab = this.state.active,
            SelectedComponent = TABS[activeTab] || 'TODO',
            handleClick = (tabName) => {
                this.setState({
                    active: tabName
                });
            },
            pageStyle = {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                alignItems: 'flex-start',
                fontFamily: 'sans-serif'
            },
            tabsStyle = {
                display: 'flex',
                height: '40px',
                flexGrow: 0,
                flexShrink: 0,
                textTransform: 'capitalize',
                color: 'white',
                fontFamily: 'sans-serif'
            },
            contentStyle = {
                height: 'auto',
                flexGrow: '1',
                overflow: 'auto',
                backgroundColor: '#80CBC4'
            },
            unselectable = require('./ui/styles').unselectable,
            newPageStyle = _.extend({}, pageStyle, unselectable);

        return (
            <div style={newPageStyle}>
                <View style={tabsStyle}>
                    {Object.keys(TABS).map( function(tabKey) {
                        return (
                            <Tab active={tabKey === activeTab}
                                 handleClick={handleClick}
                                 key={tabKey}
                                 name={tabKey}/>
                        );
                    }.bind(this))}
                    <FullscreenToggle />
                </View>
                <View style={contentStyle} id='content'>
                    {typeof SelectedComponent == 'function'? <SelectedComponent /> : <View>{SelectedComponent}</View>}
                </View>
            </div>
        );
    }
}

var touchDevice = ('ontouchstart' in window || (typeof navigator != 'undefined' && 'msMaxTouchPoints' in navigator)),
    dndBackend = touchDevice? require('react-dnd-touch-backend') : require('react-dnd-html5-backend');

module.exports = DragDropContext(dndBackend)(Tabs);
