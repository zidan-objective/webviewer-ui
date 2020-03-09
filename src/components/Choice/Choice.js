import classNames from 'classnames';
import Icon from 'components/Icon';
import PropTypes from 'prop-types';
import React from 'react';

import './Choice.scss';

const propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['checkbox', 'radio']),
  name: PropTypes.string,
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.oneOfType([PropTypes.string]).isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

const Choice = React.forwardRef(
  ({ label, checked, disabled, ...props }, ref) => {
    return (
      <span className={classNames('Choice', { 'Choice--disabled': disabled })}>
        <span className="Choice__check">
          <div
            className={classNames('Choice__icon-container', {
              'Choice__icon-container--checked': checked,
            })}
          >
            {checked ? <Icon glyph="icon-menu-checkmark" /> : undefined}
          </div>
          <input ref={ref} disabled={disabled} {...props} />
        </span>
        <label className="Choice__label" htmlFor={props.id}>
          {label}
        </label>
      </span>
    );
  },
);

Choice.propTypes = propTypes;

export default Choice;
