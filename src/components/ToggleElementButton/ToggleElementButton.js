import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Button from 'components/Button';

import selectors from 'selectors';
import actions from 'actions';

const ToggleElementButton = ({ isElementDisabled, ...restProps }) => {
  if (isElementDisabled) {
    return null;
  }

  return (
    <Button
      className={classNames({
        'toggle-element-button': true,
      })}
      {...restProps}
    />
  );
};

const mapStateToProps = (state, ownProps) => {
  let isActive = selectors.isElementOpen(state, ownProps.element);
  if (ownProps.dataElement === 'redactionButton') {
    const isToolActive = selectors.getActiveToolName(state);
    isActive = isActive || isToolActive === 'AnnotationCreateRedaction';
  }

  return {
    isElementDisabled: selectors.isElementDisabled(state, ownProps.dataElement),
    isActive,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    // hack for new ui
    if (ownProps.element === 'searchPanel') {
      dispatch(actions.closeElement('notesPanel'));
    } else if (ownProps.element === 'notesPanel') {
      dispatch(actions.closeElement('searchPanel'));
    }
    dispatch(actions.toggleElement(ownProps.element));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToggleElementButton);
