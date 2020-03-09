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
  currentTool: PropTypes.string,
  color: PropTypes.string,
  dataElement: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

const Button = props => {
  const tabbing = useTabbing();
  const [t] = useTranslation();

  const {
    disabled,
    isActive,
    mediaQueryClassName,
    img,
    activeImg,
    label,
    color,
    dataElement,
    onClick,
    className,
    title,
    currentTool,
    style,
    children: childrenFromProps,
    ...buttonProps
  } = { ...props, ...customOverrides };

  const [removeElement, customOverrides = {}] = useSelector(
    state => [
      selectors.isElementDisabled(state, dataElement),
      selectors.getCustomElementOverrides(state, dataElement)
    ],
    shallowEqual
  );

  const isBase64 = img?.trim().startsWith("data:");

  const imgToShow = img;
  // if (isActive && activeImg) {
  //   imgToShow = activeImg;
  // }

  // if there is no file extension then assume that this is a glyph
  const isGlyph =
    imgToShow &&
    !isBase64 &&
    (!imgToShow.includes(".") || imgToShow.startsWith("<svg"));
  const shouldRenderTooltip = title && !disabled;

  const translatedTitle = title ? t(title) : undefined;
  const translatedCurrentTool = currentTool ? t(currentTool) : undefined;
  const shortcut = title ? getAriaKeyshortcuts(title.split(".")[1]) : undefined;

  const combinedTitle = [translatedCurrentTool, translatedTitle].filter(Boolean).join(', ');

  const children = (
    <button
      {...buttonProps}
      className={classNames({
        Button: true,
        "Button--focus": tabbing,
        active: isActive,
        disabled,
        [mediaQueryClassName]: mediaQueryClassName,
        [className]: className
      })}
      style={style}
      data-element={dataElement}
      onClick={onClick}
      aria-label={combinedTitle}
      aria-keyshortcuts={shortcut}
      disabled={disabled}
    >
      {isGlyph && <Icon glyph={imgToShow} color={color} />}
      {imgToShow && !isGlyph && <img src={imgToShow} alt={combinedTitle} />}
      {label}
      {childrenFromProps}
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
