const React = require('react'),
    _ = require('underscore'),
    InlineSVG = require('svg-inline-react'),
    ReactDOM = require('react-dom'),
    d3 = require('d3'),
    RangeControl = require('./RangeControl');

const WIDTH = 50;

let [REST, DRAG] = [1,2];
class Slider extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            step: REST,
            height: 20
        };
    }
    render () {
        var svg = this._getSvg(),
            start = this._onDragStart.bind(this),
            drag = this._onDragMove.bind(this),
            end = this._onDragEnd.bind(this);

        switch (this.state.step) {
            case REST:
                return <div style={this._getOuterStyle()} ref="container"
                            onTouchStart={start}
                            onMouseDown={start}>
                    <InlineSVG src={svg} ref="svg"/>
                </div>;
            case DRAG:
                return <div style={this._getOuterStyle()} ref="container"
                            onTouchMove={drag}
                            onMouseMove={drag}
                            onTouchEnd={end}
                            onMouseUp={end}
                            onMouseLeave={end}
                            onTouchCancel={end}
                    >
                    <InlineSVG src={svg} ref="svg"/>
                </div>;
        }
    }

    _onDragStart (e) {
        var initialPageY = e.nativeEvent.pageY;

        this.setState({
            step: DRAG,
            pageY: initialPageY
        });
    }

    _onDragMove (e) {
        if (this.state.step === DRAG) {
            var newPageY = e.nativeEvent.pageY,
                {pageY} = this.state,
                delta = newPageY - pageY;

            this.setState({
                pageY: newPageY
            });

            this.props.onDelta(delta);
        }
    }

    _onDragEnd () {
        this.setState({
            step: REST
        });
    }

    componentDidMount () {
        this.measureHeight();
    }

    componentWillReceiveProps (next) {
        if (next.width !== this.props.width) {
            var iSvg = this.refs.svg,
                svg = ReactDOM.findDOMNode(iSvg),
                svg = svg.getElementsByTagName('svg')[0];

            svg.style.width = next.width;

            this.measureHeight();
        }
    }

    measureHeight () {
        var iSvg = this.refs.svg,
            svg = ReactDOM.findDOMNode(iSvg),
            svg = svg.getElementsByTagName('svg')[0],
            height = svg.offsetHeight;

        console.log('new slider height ' + height, svg.offsetHeight);

        this.setState({height});
    }
}

class SliderMin extends Slider {
    _getSvg () {
        return require('ui/handle-down.svg');
    }

    _getOuterStyle () {
        var {offset} = this.props,
            heightAdjustedOffset = offset - this.state.height;

        return {
            position: 'absolute',
            width: this.props.width + 'px',
            top: offset + 'px',
            zIndex: 1
        }
    }
}

class SliderMax extends Slider {
    _getSvg () {
        return require('ui/handle-up.svg');
    }

    _getOuterStyle () {
        var {offset} = this.props,
            heightAdjustedOffset = offset - this.state.height;

        return {
            position: 'absolute',
            width: this.props.width + 'px',
            bottom: offset + 'px',
            zIndex: 1
        }
    }
}

class RangeBar extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            width: 0
        };
    }
    _getOuterStyle () {
        return {
            position: 'absolute',
            zIndex: 0
        }
    }

    componentDidMount () {
        this.resize();
    }

    componentWillReceiveProps (nextProps) {
        var {height} = this.props,
            _h = nextProps.height;

        if (height !== _h)
            this.resize();
    }

    propagateWidth (w) {
        if (this.state.width !== w) {
            this.setState({width: w});

            this.props.onFindWidth(w);
        }
    }

    resize () {
        var svg = ReactDOM.findDOMNode(this.refs.svg);
        svg = svg.getElementsByTagName('svg')[0];
        svg.style.height = this.props.height;

        var width = svg.offsetWidth;
        this.propagateWidth(width);
    }

    render () {
        var svg = require('ui/range-bar.svg');

        return <div style={this._getOuterStyle()} >
            <InlineSVG src={svg} ref="svg"/>
        </div>
    }
}

const clamp = (val, min, max) => {
    return Math.max(min, Math.min(val, max));
};

class SliderView extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            width: WIDTH
        };
    }

    _getOuterStyle () {
        var {width} = this.state;

        return {
            position: 'relative',
            flex: '0 0 ' + width + 'px'
        };
    }

    render () {
        var {minOffset, minUpdate, maxOffset, maxUpdate, height} = this.props,
            {width} = this.state,
            onRangeBarRender = (w) => {
            this.setState({
                width: w
            });
        };

        return <div style={this._getOuterStyle()}>
            <SliderMin width={width}
                       offset={minOffset}
                       onDelta={minUpdate} />
            <RangeBar height={height} onFindWidth={onRangeBarRender}/>
            <SliderMax width={width}
                       offset={maxOffset}
                       onDelta={maxUpdate} />
        </div>;
    }
}

class RangeSelector extends React.Component {
    constructor (props) {
        super(props);

        var stats = props.field.stats,
            floor = stats.min,
            ceiling = stats.max;

        var scale = d3.scale.linear()
            .interpolate(d3.interpolateRound)
            .domain([floor, ceiling])
            .rangeRound([0, props.height])
            .clamp(true);

        this.state = {
            min: floor,
            max: ceiling,
            scale: scale
        };
    }

    _offsetToValue (offset) {
        var {scale} = this.state;

        return Math.round(scale.invert(offset));
    }

    _valueToOffset (value) {
        var {scale} = this.state;

        return scale(value);
    }

    _getOuterStyle () {
        return {
            display: 'flex',
            flexGrow: 1
        };
    }

    _updateMin (newValue) {
        var {max} = this.state,
            {field} = this.props,
            floor = field.stats.min;

        this.setState({
            min: clamp(newValue, floor, max)
        });
    }

    _updateMax (newValue) {
        var {min} = this.state,
            {field} = this.props,
            ceiling = field.stats.max;

        this.setState({
            max: clamp(newValue, min, ceiling)
        });
    }

    render () {
        var {min, max} = this.state,
            {width, height, field} = this.props,
            minOffset = this._valueToOffset(min),
            maxOffset = Math.max(height - this._valueToOffset(max), 0),
            deltaUpdate = (previousOffset, delta) => {
                var newOffset = Math.max(previousOffset + delta, 0),
                    newValue = this._offsetToValue(newOffset);

                return newValue;
            },
            minUpdate = (delta) => {
                var {max, min} = this.state,
                    previous = this._valueToOffset(min),
                    newValue = deltaUpdate(previous, delta);

                this._updateMin(newValue);
            }, maxUpdate = (delta) => {
                var {max, min} = this.state,
                    previous = this._valueToOffset(max),
                    newValue = deltaUpdate(previous, delta);

                this._updateMax(newValue)
            };

        return <div style={this._getOuterStyle()}>
            <SliderView {...{minOffset, minUpdate, maxOffset, maxUpdate, height}} />
            <RangeControl {...{min, max, field}}
                onUpdateMin={this._updateMin.bind(this)}
                onUpdateMax={this._updateMax.bind(this)}/>
        </div>;
    }
}

RangeSelector.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    field: React.PropTypes.object.isRequired
};

module.exports = RangeSelector;
