import core from 'core';
import getHashParams from 'helpers/getHashParams';
import fireEvent from 'helpers/fireEvent';
import actions from 'actions';
import { workerTypes } from 'constants/types';
import { PRIORITY_ONE, PRIORITY_THREE } from 'constants/actionPriority';

let onFirstLoad = true;

export default dispatch => () => {
  const {
    a: enableAnnotations,
    enableRedaction,
  } = getHashParams();

  dispatch(actions.openElement('pageNavOverlay'));

  if (onFirstLoad) {
    onFirstLoad = false;
    // redaction button starts hidden. when the user first loads a document, check HashParams the first time
    core.enableRedaction(enableRedaction || core.isCreateRedactionEnabled());
    // if redaction is already enabled for some reason (i.e. calling readerControl.enableRedaction() before loading a doc), keep it enabled

    if (core.isCreateRedactionEnabled()) {
      dispatch(actions.enableElement('redactionButton', PRIORITY_ONE));
    } else {
      dispatch(actions.disableElement('redactionButton', PRIORITY_ONE));
    }
  }

  core.setOptions({
    enableAnnotations,
  });

  const doc = core.getDocument();
  if (doc.getType() === workerTypes.PDF) {
    dispatch(actions.enableElement('cropToolButton', PRIORITY_THREE));
  } else {
    dispatch(actions.disableElement('cropToolButton', PRIORITY_THREE));
  }

  window.readerControl.loadedFromServer = false;
  window.readerControl.serverFailed = false;

  fireEvent('documentLoaded');
};
