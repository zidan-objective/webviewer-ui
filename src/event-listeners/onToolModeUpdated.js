import $ from 'jquery';

import core from 'core';
import fireEvent from 'helpers/fireEvent';
import actions from 'actions';
import defaultTool from 'constants/defaultTool';

export default dispatch => (e, newTool, oldTool) => {
  if (oldTool && oldTool.name === 'TextSelect') {
    core.clearSelection();
    dispatch(actions.closeElement('textPopup'));
  }

  if (newTool && newTool.name === defaultTool) {
    dispatch(actions.setActiveToolGroup(''));
    dispatch(actions.closeElement('toolsOverlay'));
  }

  dispatch(actions.setActiveToolNameAndStyle(newTool));
  fireEvent('toolModeChanged', [newTool, oldTool]);
};