import core from 'core';
import actions from 'actions';

export default dispatch => options => {
  dispatch(actions.setDocumentLoaded(true));
  dispatch(actions.openElement('pageNavOverlay'));
  dispatch(actions.setLoadingProgress(1));
  setTimeout(() => {
    dispatch(actions.closeElement('progressModal'));
    dispatch(actions.resetLoadingProgress());
  }, 300);

  if (window.innerWidth <= 640) {
    core.fitToWidth();
  } else {
    core.fitToPage();
  }
  core.setOptions({
    enableAnnotations: !options.hideAnnotationPanel || false
  });

  core.getOutlines(outlines => {
    dispatch(actions.setOutlines(outlines));
  });

  window.readerControl.loadedFromServer = false;
  window.readerControl.serverFailed = false;

  $(document).trigger('documentLoaded');
};