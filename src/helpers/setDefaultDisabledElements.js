import getAnnotationRelatedElements from 'helpers/getAnnotationRelatedElements';
import { isIOS, isAndroid } from 'helpers/device';
import { PRIORITY_THREE, PRIORITY_ONE } from 'constants/actionPriority';
import actions from 'actions';

export default (store, options) => {
  const { dispatch, getState } = store;
  const state = getState();

  disableElementsPassedByConstructor(state, dispatch,);
  disableElementsIfReadOnly(state, dispatch);
  disableElementsIfAnnotationDisabled(state, dispatch, options);
  disableElementsIfFilePickerDisabled(dispatch, options);
  disableElementsIfHideAnnotationPanel(dispatch, options);
  disableElementsIfToolBarDisabled(dispatch, options);
  disableElementsIfDesktop(dispatch);
};

const disableElementsPassedByConstructor = (state, dispatch) => {
  if (state.advanced.defaultDisabledElements) {
    const elements = state.advanced.defaultDisabledElements.split(',');
    dispatch(actions.disableElements(elements, PRIORITY_THREE));
  }
};

const disableElementsIfReadOnly = (state, dispatch) => {
  if (state.viewer.isReadOnly) {
    const elements = [
      'annotationPopup',
      ...getAnnotationRelatedElements(state)
    ];

    dispatch(actions.disableElements(elements, PRIORITY_ONE));
  }
};

const disableElementsIfAnnotationDisabled = (state, dispatch, options) => {
  const annotationDisabled = options.hideAnnotationPanel || false;
  if (annotationDisabled) {
    const elements = [
      'notesPanel',
      'notesPanelButton',
      ...getAnnotationRelatedElements(state),
    ];

    dispatch(actions.disableElements(elements, PRIORITY_ONE));
  }
};

const disableElementsIfFilePickerDisabled = (dispatch, options) => {
  const filePickerDisabled = options.filepicker || false;

  if (filePickerDisabled) {
    const elements = [
      'filePickerHandler',
      'filePickerButton',
    ];

    dispatch(actions.disableElements(elements, PRIORITY_ONE));
  }
};

const disableElementsIfHideAnnotationPanel = (dispatch, options) => {
  const hideAnnotationPanel = options.hideAnnotationPanel || false;

  if (hideAnnotationPanel) {
    const elements = [
      'notesPanel',
      'notesPanelButton',
      'annotationCommentButton'
    ];

    dispatch(actions.disableElements(elements, PRIORITY_ONE));
  }
};

const disableElementsIfToolBarDisabled = (dispatch, options) => {
  const toolBarDisabled = typeof options.toolbar === 'boolean' ? options.toolbar : false;

  if (toolBarDisabled) {
    dispatch(actions.disableElement('header', PRIORITY_ONE));
  }
};

const disableElementsIfDesktop = dispatch => {
  // we could have used the 'hidden' property in the initialState.js to hide this button by css,
  // but that actually checks the window.innerWidth to hide the button, not based on the actual device.
  // we could potentially improve the 'hidden' property in the future.
  if (!(isIOS || isAndroid)) {
    dispatch(actions.disableElement('textSelectButton', PRIORITY_ONE));
  }
};