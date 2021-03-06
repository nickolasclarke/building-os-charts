var React = require('react');
var d3 = require('d3');
var { array, bool, func, number, object, oneOf, string } = React.PropTypes;
var { DATA_HOVER, MOUSE_MOVE, MOUSE_OUT, getNamespaced } = require('../events/events');
var { isValid } = require('../validators/number-validator');
var { stretch } = require('../utils/data-util');
var classNames = require('classnames');
var Dispatcher = require('../events/dispatcher');
var LineMarker = require('./line-marker');

var _componentShouldResetPoints = false;

module.exports = React.createClass({

  propTypes: {
    bisector: func.isRequired,
    className: string,
    data: array.isRequired,
    height: number.isRequired,
    id: number.isRequired,
    interaction: oneOf(['none', 'mouseover']),
    interpolate: oneOf([
      // From https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate
      'basis',
      'basis-open',
      'basis-closed',
      'bundle',
      'cardinal',
      'cardinal-open',
      'cardinal-closed',
      'linear',
      'linear-closed',
      'monotone',
      'step',
      'step-before',
      'step-after'
    ]).isRequired,
    marker: oneOf(['snap', 'smooth']),
    offset: number.isRequired,
    scaleY: func.isRequired,
    stretch: bool,
    style: object,
    tickWidth: number.isRequired,
    type: oneOf(['area', 'line']).isRequired,
    width: number.isRequired
  },

  getDefaultProps() {
    return {
      bisector: d3.bisector((datum) => {
        if (datum.hasOwnProperty('value')) {
          return datum.value;
        }
        if (datum.hasOwnProperty('x')) {
          return datum.x;
        }
      }).right,
      data: [],
      height: 0,
      id: 0,
      interaction: 'mouseover',
      interpolate: 'cardinal',
      marker: 'snap',
      offset: 0,
      scaleY: Function,
      tickWidth: 0,
      type: 'line',
      width: 0
    };
  },

  getInitialState() {
    return {
      activeIndex: -1,
      markerX: 0,
      markerY: 0,
      points: [],
      segmentWidth: this.getSegmentWidth()
    };
  },

  componentDidMount() {
    this.addEventListeners();
    this.setPoints();
  },

  componentWillReceiveProps() {
    _componentShouldResetPoints = true;
  },

  componentDidUpdate() {
    if (_componentShouldResetPoints) {
      _componentShouldResetPoints = false;
      this.setPoints();
    }
    this.dispatchEvents();
  },

  componentWillUnmount() {
    this.removeEventListeners();
  },

  dispatchEvents() {
    Dispatcher[DATA_HOVER]({
      type: DATA_HOVER,
      datum: this.state.activeDatum,
      id: this.props.id
    });
  },

  getMarkerPosition(activeIndex, mouseX) {
    if (!this.props.data[activeIndex]) {
      return {
        x: 0,
        y: 0
      };
    }

    if (this.props.marker === 'snap') {
      var datum = this.props.data[activeIndex];
      return {
        datum: datum,
        x: Math.floor((this.state.segmentWidth * activeIndex) + this.props.offset),
        y: Math.round(this.props.scaleY(datum.value))
      };
    }

    if (this.props.marker === 'smooth') {
      var index = this.props.bisector(this.state.points, mouseX);
      var point = this.state.points[index];
      var value = this.props.scaleY.invert(point.y);
      return {
        datum: {value: value},
        x: Math.round(point.x),
        y: Math.round(point.y)
      };
    }
  },

  getSegmentWidth() {
    return this.props.offset ?
      this.props.tickWidth :
      Math.round(this.props.width / this.props.data.length);
  },

  setPoints() {
    if (this.props.marker === 'smooth') {
      var path = React.findDOMNode(this.refs.path);
      var pathLength = path.getTotalLength();
      var points = [];
      for (var ii = 0; ii < pathLength; ii++) {
        points.push(path.getPointAtLength(ii));
      }
      this.setState({points: points});
    }
  },

  addEventListeners() {
    if (this.props.interaction === 'none') {
      return;
    }

    Dispatcher.on(getNamespaced(MOUSE_MOVE, this.props.id), (event) => {
      var markerPosition = this.getMarkerPosition(
        event.activeIndex,
        event.x);
      this.setState({
        activeDatum: markerPosition.datum,
        activeIndex: event.activeIndex,
        markerX: markerPosition.x,
        markerY: markerPosition.y
      });
    });

    Dispatcher.on(getNamespaced(MOUSE_OUT, this.props.id), () => {
      this.setState({
        activeDatum: null,
        activeIndex: -1,
        markerX: 0,
        markerY: 0
      });
    });
  },

  removeEventListeners() {
    Dispatcher.on(getNamespaced(MOUSE_MOVE, this.props.id), null);
    Dispatcher.on(getNamespaced(MOUSE_OUT, this.props.id), null);
  },

  render() {
    var area = Function;
    if (this.props.type === 'area') {
      area = d3.svg.area()
        .defined((datum) => isValid(datum.value) ? datum.value : null)
        .interpolate(this.props.interpolate)
        .x((datum, index) =>
          Math.floor((this.state.segmentWidth * index) + this.props.offset)
        )
        .y0(this.props.height)
        .y1((datum) => Math.round(this.props.scaleY(datum.value)));
    }

    var line = d3.svg.line()
      .defined((datum) => isValid(datum.value) ? datum.value : null)
      .interpolate(this.props.interpolate)
      .x((datum, index) =>
        Math.floor((this.state.segmentWidth * index) + this.props.offset)
      )
      .y((datum) => Math.round(this.props.scaleY(datum.value)));

    var data = this.props.stretch ?
      stretch(this.props.data) : this.props.data;

    var className = (this.props.type === 'area' ? 'area' : 'line') + '-series';

    var style = {};
    if (this.props.style) {
      style.area = {
        fill: this.props.style.fill,
        opacity: this.props.style.opacity
      };
      style.line = {
        fill: 'none',
        stroke: this.props.style.stroke
      };
      style.marker = {
        stroke: this.props.style.stroke
      };
    }

    return (
      <g className={classNames(className, this.props.className)}>

        {this.props.type === 'area' ? (
          <path
            className={'area'}
            d={area(data)}
            style={style.area} />
        ) : null}

        <path
          className={'line'}
          d={line(data)}
          ref={'path'}
          style={style.line} />

        {this.props.data[this.state.activeIndex] ? (
          <LineMarker
            style={style.marker}
            x={this.state.markerX}
            y={this.state.markerY} />
        ) : null}

      </g>
    );
  }

});
