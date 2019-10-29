import actions from 'actions';
import fireEvent from 'helpers/fireEvent';

export default dispatch => () => {
  dispatch(actions.closeElements(['annotationPopup', 'textPopup', 'contextMenuPopup']));

  fireEvent('layoutModeChanged', [window.docViewer.getDisplayModeManager().getDisplayMode()]);
};