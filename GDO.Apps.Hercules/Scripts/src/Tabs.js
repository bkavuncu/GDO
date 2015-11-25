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
        var {name, active, handleClick} = this.props,
            color = active? '#80cbc4' : '#009688',
            tabStyle = {
                flexGrow: 1,
                width: 'auto',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: color,
                transition: 'background-color ease-in 0.2s'
            };

        return (
            <View style={tabStyle} onTouchTap={handleClick}>
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

class Tabs extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            selectedIndex: 0
        };
    }

    _getTabClickHandler (selectedIndex) {
        return () => this.setState({selectedIndex});
    }

    static _getPageStyle () {
        var pageStyle = {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            alignItems: 'flex-start',
            fontFamily: 'sans-serif'
        }, unselectable = require('./ui/styles').unselectable;

        return _.extend({}, pageStyle, unselectable);
    }

    static _getTabsBarStyle () {
        return {
            display: 'flex',
            height: '40px',
            flexGrow: 0,
            flexShrink: 0,
            textTransform: 'capitalize',
            color: 'white',
            fontFamily: 'sans-serif'
        };
    }

    static _getContentStyle () {
        return {
            height: 'auto',
            flexGrow: '1',
            overflow: 'auto',
            backgroundColor: '#80CBC4'
        };
    }

    componentWillReceiveProps (newProps) {
        // resets selected index if index is larger than available children
        if (this.state.selectedIndex > newProps.children.length - 1) {
            this.setState({
                selectedIndex: 0
            });
        }
    }

    render () {
        var {selectedIndex} = this.state,
            {children} = this.props,
            SelectedChild = children[selectedIndex];

        return <div style={Tabs._getPageStyle()}>
            <View style={Tabs._getTabsBarStyle()}>
                {children.map((ChildClass, index) => {
                    return (
                        <Tab active={index === selectedIndex}
                             handleClick={this._getTabClickHandler(index)}
                             key={index}
                             name={ChildClass.prototype.tabName}/>
                    );
                })}
                <FullscreenToggle />
            </View>
            <View style={Tabs._getContentStyle()} id='content'>
                <SelectedChild />
            </View>
        </div>;
    }
}

var touchDevice = ('ontouchstart' in window || (typeof navigator != 'undefined' && 'msMaxTouchPoints' in navigator)),
    dndBackend = touchDevice? require('react-dnd-touch-backend') : require('react-dnd-html5-backend');

module.exports = DragDropContext(dndBackend)(Tabs);
