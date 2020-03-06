import React from "react";
import { useSelector, shallowEqual } from "react-redux";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import Tooltip from "components/Tooltip";
import Icon from "components/Icon";

import { getAriaKeyshortcuts } from "helpers/a11y";

import { useTabbing } from "hooks/useTabbing";

import selectors from "selectors";

import "./Button.scss";

const propTypes = {
  isActive: PropTypes.bool,
  mediaQueryClassName: PropTypes.string,
  img: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  color: PropTypes.string,
  dataElement: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

const NOOP = () => {};

const Button = props => {
  const [removeElement, customOverrides = {}] = useSelector(
    state => [
      selectors.isElementDisabled(state, props.dataElement),
      selectors.getCustomElementOverrides(state, props.dataElement)
    ],
    shallowEqual
  );

  const tabbing = useTabbing();

  const [t] = useTranslation();

  const {
    disable,
    isActive,
    mediaQueryClassName,
    img,
    activeImg,
    label,
    color,
    dataElement,
    onClick = NOOP,
    className,
    title,
    style
  } = { ...props, ...customOverrides };

  const isBase64 = img?.trim().startsWith("data:");

  let imgToShow = img;
  if (isActive && activeImg) {
    imgToShow = activeImg;
  }

  // if there is no file extension then assume that this is a glyph
  const isGlyph =
    imgToShow &&
    !isBase64 &&
    (!imgToShow.includes(".") || imgToShow.startsWith("<svg"));
  const shouldRenderTooltip = title && !disable;

  const translatedTitle = title ? t(title) : undefined;
  const shortcut = title ? getAriaKeyshortcuts(title.split(".")[1]) : undefined;

  const children = (
    <button
      className={classNames({
        Button: true,
        "Button--focus": tabbing,
        active: isActive,
        disable,
        [mediaQueryClassName]: mediaQueryClassName,
        [className]: className
      })}
      style={style}
      data-element={dataElement}
      onClick={disable ? NOOP : onClick}
      aria-label={translatedTitle}
      aria-keyshortcuts={shortcut}
    >
      {isGlyph && <Icon glyph={imgToShow} color={color} />}
      {imgToShow && !isGlyph && <img src={imgToShow} />}
      {label && <p>{label}</p>}
    </button>
  );

  return removeElement ? null : shouldRenderTooltip ? (
    <Tooltip content={title}>{children}</Tooltip>
  ) : (
    children
  );
};

Button.propTypes = propTypes;

export default React.memo(Button);
