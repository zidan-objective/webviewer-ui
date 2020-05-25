import core from 'core';
import actions from 'actions';
import defaultTool from 'constants/defaultTool';
import fireEvent from 'helpers/fireEvent';
import selectors from 'selectors';

export default store => (newTool, oldTool) => {
  const { dispatch, getState } = store;

  if (oldTool?.name === 'TextSelect') {
    core.clearSelection();
    dispatch(actions.closeElement('textPopup'));
  }

  if (
    core.isStylusModeEnabled() &&
    oldTool?.name === 'Pan' &&
    oldTool.previousStylusTool === newTool
  ) {
    const toolGroup = selectors.getToolButtonObject(getState(), newTool.name)?.group || '';
    dispatch(actions.setActiveToolGroup(toolGroup));
  }

  if (newTool?.name === defaultTool) {
    dispatch(actions.setActiveToolGroup(''));
    dispatch(actions.closeElement('toolsOverlay'));
  }

  dispatch(actions.setActiveToolNameAndStyle(newTool));

  fireEvent('toolModeChanged', [newTool, oldTool]);
};