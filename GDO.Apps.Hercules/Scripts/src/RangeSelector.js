const React = require('react'),
    InlineSVG = require('svg-inline-react'),
    ReactDOM = require('react-dom');

const WIDTH = 50;

let [REST, DRAG] = [1,2];
class Slider extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            step: REST
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

    _onDragEnd (e) {
        console.log('end');
        this.setState({
            step: REST
        });
    }

    componentDidUpdate () {
        var iSvg = this.refs.svg,
            svg = ReactDOM.findDOMNode(iSvg),
            svg = svg.getElementsByTagName('svg')[0];

        svg.style.width = this.props.width;
    }
}

class SliderMin extends Slider {
    _getSvg () {
        return require('ui/handle-down.svg');
    }

    _getOuterStyle () {
        var {offset} = this.props;

        console.log(offset);

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
        var {offset} = this.props;

        console.log(offset);

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

    componentWillReceiveProps () {
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

        console.log('resizing');

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

class RangeSelector extends React.Component {
    constructor (props) {
        super(props);

        console.log(props);
        this.state = {
            barWidth: WIDTH,
            min: props.floor,
            max: props.ceiling
        };
    }

    _offsetToValue (offset) {
        var {height, ceiling} = this.props,
            value = (offset/height) * ceiling;

        console.log('yo', offset, value);
        return Math.round(value);
    }

    _valueToOffset (value) {
        var {height, ceiling} = this.props,
            offset = (value / ceiling) * height;

        return Math.round(offset);
    }

    getOuterStyle () {
        var {width, height} = this.props;
        return {
            height: height,
            width: width,
            position: 'relative'
        };
    }

    render () {
        const onRangeBarRender = (w) => {
            this.setState({
                barWidth: w
            });
        };

        var {min, max, barWidth} = this.state,
            {width, height} = this.props,
            sliderWidth = barWidth,
            minOffset = this._valueToOffset(min),
            maxOffset = Math.max(height - this._valueToOffset(max), 0),
            deltaUpdate = (previousOffset, delta) => {
                var newOffset = Math.max(previousOffset + delta, 0),
                    newValue = this._offsetToValue(newOffset);

                return newValue;
            },
            minUpdate = (delta) => {
                var previous = this._valueToOffset(this.state.min),
                    newValue = deltaUpdate(previous, delta);

                this.setState({
                    min: newValue
                });
            }, maxUpdate = (delta) => {
                var previous = this._valueToOffset(this.state.max),
                    newValue = deltaUpdate(previous, delta);

                this.setState({
                    max: newValue
                });
            };

        return <div style={this.getOuterStyle()}>
            <SliderMin width={sliderWidth}
                       offset={minOffset}
                       onDelta={minUpdate} />
            <RangeBar {...this.props} onFindWidth={onRangeBarRender}/>
            <SliderMax width={sliderWidth}
                       offset={maxOffset}
                       onDelta={maxUpdate} />
        </div>;
    }
}

RangeSelector.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    floor: React.PropTypes.number.isRequired,
    ceiling: React.PropTypes.number.isRequired,
//    min: React.PropTypes.number.isRequired,
//    max: React.PropTypes.number.isRequired
};

module.exports = RangeSelector;
