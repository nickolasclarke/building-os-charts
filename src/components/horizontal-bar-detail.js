var React = require('react');
var { number, string } = React.PropTypes;
var SvgImage = require('./svg-image');
var Label = require('./label');
var { getLayout } = require('../layouts/flexbox');

var _componentShouldSetLayoutAfterUpdate = false;

module.exports = React.createClass({

  propTypes: {
    height: number.isRequired,
    icon: string,
    iconHeight: number,
    label: string,
    width: number.isRequired
  },

  getInitialState() {
    return {
      layout: {}
    };
  },

  componentDidMount() {
    this.setLayout();
  },

  componentWillReceiveProps() {
    _componentShouldSetLayoutAfterUpdate = true;
  },

  componentDidUpdate() {
    // Prevents an infinite loop:
    if (_componentShouldSetLayoutAfterUpdate) {
      _componentShouldSetLayoutAfterUpdate = false;
      this.setLayout();
    }
  },

  setLayout() {
    this.setState({
      layout: getLayout(React.findDOMNode(this.refs.node), {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        height: this.props.height,
        justifyContent: 'flex-end',
        width: this.props.width
      }, [
        {style: {marginRight: 10}},
        {style: {marginRight: 10}}
      ])
    });
  },

  render() {
    return (
      <g className={'horizontal-bar-detail'} ref="node">

        {this.props.label ? (
          <Label
            className={'horizontal-bar-detail-label'}
            text={this.props.label}
            x={this.state.layout.children ? this.state.layout.children[0].left : 0}
            y={this.state.layout.children ? this.state.layout.children[0].top : 0} />
        ) : null}

        {this.props.icon ? (
          <SvgImage
            className={'horizontal-bar-detail-icon'}
            height={this.props.iconHeight}
            url={this.props.icon}
            width={this.props.iconHeight}
            x={this.state.layout.children ? this.state.layout.children[1].left : 0}
            y={this.state.layout.children ? this.state.layout.children[1].top : 0} />
        ) : null}

      </g>
    );
  }

});
