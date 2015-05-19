var React = require('react');
var { number, string } = React.PropTypes;

module.exports = React.createClass({

  propTypes: {
    className: string,
    height: number.isRequired,
    id: string.isRequired,
    width: number.isRequired
  },

  getDefaultProps: function() {
    return {
      height: 0,
      id: '',
      width: 0
    };
  },

  render: function() {
    return (
      <clipPath className={this.props.className}
        id={this.props.id}>
        <rect
          height={this.props.height}
          width={this.props.width} />
      </clipPath>
    );
  }

});
