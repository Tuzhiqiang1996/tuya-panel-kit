import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Animated, Easing, ViewPropTypes, Dimensions } from 'react-native';

const { height: winHeight } = Dimensions.get('window');

const DEFAULT_ANIMATION_CONFIG = {
  duration: 300,
  delay: 0,
  isInteraction: true,
  useNativeDriver: true,
};

class ScalePullDown extends PureComponent {
  static displayName = 'Motion.ScalePullDown';
  static propTypes = {
    style: ViewPropTypes.style,
    show: PropTypes.bool,
    initScale: PropTypes.number,
    showDuration: PropTypes.number,
    hideDuration: PropTypes.number,
    children: PropTypes.element.isRequired,
    onShow: PropTypes.func,
    isAlign: PropTypes.bool,
    onHide: PropTypes.func,
    animationConfig: PropTypes.shape({
      duration: PropTypes.number,
      delay: PropTypes.number,
      isInteraction: PropTypes.bool,
      useNativeDriver: PropTypes.bool,
    }),
  };

  static defaultProps = {
    style: null,
    show: undefined,
    showDuration: 300,
    hideDuration: 300,
    initScale: 0,
    isAlign: true,
    onShow: () => {},
    onHide: () => {},
    animationConfig: DEFAULT_ANIMATION_CONFIG,
  };

  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      scale: new Animated.Value(props.initScale),
      opacity: new Animated.Value(0),
      dropHeight: new Animated.Value(0),
      measuredHeight: winHeight,
      isAnimating: false,
    };
  }

  componentDidMount() {
    if (this.state.show) {
      this.startShowAnimation();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { show } = nextProps;
    if (!this.state.isAnimating && typeof show !== 'undefined' && show !== this.state.show) {
      this.startAnimation(show);
    }
  }

  componentWillUnmount() {
    this.state.scale.stopAnimation();
    this.state.opacity.stopAnimation();
  }

  startAnimation = show => {
    if (show) {
      this.setState({ show, isAnimating: true }, this.startShowAnimation);
    } else {
      this.setState({ isAnimating: true }, this.startHideAnimation);
    }
  };

  startShowAnimation = () => {
    const { onShow, showDuration } = this.props;
    const animationConfig = { ...DEFAULT_ANIMATION_CONFIG, ...this.props.animationConfig };
    Animated.parallel([
      Animated.timing(this.state.scale, {
        toValue: 1,
        ...animationConfig,
        duration: showDuration,
        easing: Easing.bezier(0, 0, 0.25, 1),
      }),
      Animated.timing(this.state.opacity, {
        toValue: 1,
        ...animationConfig,
        duration: showDuration,
        easing: Easing.bezier(0, 0, 0.25, 1),
      }),
    ]).start(({ finished }) => {
      if (finished) {
        this.setState({ isAnimating: false }, () => {
          typeof onShow === 'function' && onShow();
          this._viewRef &&
            this._viewRef._component.measureInWindow((positionX, positionY, width, height) => {
              this.setState({ measuredHeight: winHeight - positionY });
            });
        });
      }
    });
  };

  startHideAnimation = () => {
    const { onHide, hideDuration } = this.props;
    const animationConfig = { ...DEFAULT_ANIMATION_CONFIG, ...this.props.animationConfig };
    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 0,
        ...animationConfig,
        duration: hideDuration,
        easing: Easing.bezier(0.42, 0, 1, 1),
      }),
      Animated.timing(this.state.dropHeight, {
        toValue: 1,
        ...animationConfig,
        duration: hideDuration,
        easing: Easing.bezier(0.38, 0, 0.25, 1),
      }),
    ]).start(({ finished }) => {
      if (finished) {
        this.setState({ show: false, isAnimating: false }, () => {
          typeof onHide === 'function' && onHide();
        });
      }
    });
  };

  render() {
    const { style, children, isAlign } = this.props;
    if (!this.state.show || !React.isValidElement(children)) {
      return null;
    }
    return (
      <Animated.View
        renderToHardwareTextureAndroid={this.state.isAnimating}
        ref={ref => {
          this._viewRef = ref;
        }}
        style={[
          style,
          {
            justifyContent: 'center',
            opacity: this.state.opacity,
            transform: [
              {
                scale: this.state.scale,
              },
              {
                translateY: this.state.dropHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, this.state.measuredHeight || winHeight],
                }),
              },
            ],
          },
          isAlign && { alignItems: 'center' },
        ]}
      >
        {children}
      </Animated.View>
    );
  }
}

export default ScalePullDown;
