import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'components/Icon';

import './Button.scss';

class Button extends React.PureComponent {
  static propTypes = {
    willFocus: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isActive: PropTypes.bool,
    isAccessible: PropTypes.bool,
    mediaQueryClassName: PropTypes.string,
    img: PropTypes.string,
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    title: PropTypes.string,
    color: PropTypes.string,
    dataElement: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  }

  onClick = e => {
    this.props.onClick(e);
  }

  onKeyPress = e => {
    if (e.nativeEvent.key === 'Enter' || e.nativeEvent.code === 'Space') {
      this.props.onClick(e);
    }
  }

  render() {
    const { isDisabled, isActive, mediaQueryClassName, img, label, color, dataElement, isAccessible } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = [
      'Button',
      this.props.className ? this.props.className : '',
      isActive ? 'active' : 'inactive',
      label ? 'label' : 'icon',
      mediaQueryClassName ? mediaQueryClassName : '',
    ].join(' ').trim();
    const isBase64 = img && img.trim().indexOf('data:') === 0;
    // if there is no file extension then assume that this is a glyph
    const isGlyph = img && (img.indexOf('.') === -1 || img.indexOf('<svg') === 0) && !isBase64;

    return (
      <div
        tabIndex={isAccessible ? 0 : -1}
        role="button"
        className={className}
        data-element={dataElement}
        onClick={this.onClick}
        onKeyPress={this.onKeyPress}
      >
        {isGlyph &&
          <Icon glyph={img} color={color} />
        }
        {img && !isGlyph &&
          <img src={img} />
        }
        {label &&
          <p>{label}</p>
        }
      </div>
    );
  }
}

export default Button;
