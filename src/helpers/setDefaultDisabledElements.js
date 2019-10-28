import core from 'core';
import createDisableFeatures from 'src/apis/disableFeatures';
import getWebViewerConstructorOptions from 'helpers/getWebViewerConstructorOptions';
import { isMobileDevice } from 'helpers/device';
import { PRIORITY_THREE, PRIORITY_ONE } from 'constants/actionPriority';
import Feature from 'constants/feature';
import actions from 'actions';

export default store => {
  const { dispatch } = store;
  const disableFeatures = createDisableFeatures(store);
  const {
    enableAnnotations,
    enableFilePicker,
    enableReadOnlyMode,
    hideAnnotationPanel,
    enableMeasurement,
    enableRedaction,
    disabledElements,
    showToolbarControl = true,
  } = getWebViewerConstructorOptions();

  if (disabledElements) {
    const elements = disabledElements.split(',');
    dispatch(actions.disableElements(elements, PRIORITY_THREE));
  }

  if (enableReadOnlyMode) {
    core.setReadOnly(enableReadOnlyMode);
  }

  if (!enableAnnotations) {
    disableFeatures([Feature.Annotations]);
  }

  if (!enableFilePicker) {
    disableFeatures([Feature.FilePicker]);
  }

  if (hideAnnotationPanel) {
    disableFeatures([Feature.NotesPanel]);
  }

  if (!enableMeasurement) {
    disableFeatures([Feature.Measurement]);
  }

  if (!(enableRedaction || core.isCreateRedactionEnabled())) {
    disableFeatures([Feature.Redaction]);
  }

  if (!showToolbarControl) {
    dispatch(actions.disableElement('header', PRIORITY_ONE));
  }

  if (isMobileDevice) {
    dispatch(actions.disableElement('marqueeToolButton', PRIORITY_THREE));
  } else {
    // we could have used the 'hidden' property in the initialState.js to hide this button by css,
    // but that actually checks the window.innerWidth to hide the button, not based on the actual device.
    // we could potentially improve the 'hidden' property in the future.
    dispatch(actions.disableElement('textSelectButton', PRIORITY_THREE));
  }

  // disable layersPanel by default, it will be enabled in onDocumentLoaded.js
  dispatch(
    actions.disableElements(['layersPanel', 'layersPanelButton'], PRIORITY_ONE),
  );
};
