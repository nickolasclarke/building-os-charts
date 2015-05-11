var React = require('react');
var { number, object, string } = React.PropTypes;
var { getTranslateFromCoords } = require('../utils/svg-util');

module.exports = React.createClass({

  propTypes: {
    height: number.isRequired,
    index: number.isRequired,
    style: object,
    timestamp: object.isRequired,
    value: number.isRequired,
    valueFormatted: string,
    width: number.isRequired,
    x: number.isRequired,
    y: number.isRequired
  },

  getDefaultProps: function() {
    return {
      height: 0,
      index: 0,
      timestamp: new Date(),
      value: 0,
      width: 0,
      x: 0,
      y: 0
    };
  },

  render: function() {
    return (
      <circle className={'plot-point'}
        cx={this.props.x}
        cy={this.props.y}
        r={Math.round(this.props.width / 4)}
        style={this.props.style} />
    );
  }

});