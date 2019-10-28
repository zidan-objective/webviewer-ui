import { saveAs } from 'file-saver';

import core from 'core';
import { isIE } from 'helpers/device';
import fireEvent, { fireError } from 'helpers/fireEvent';
import actions from 'actions';

export default async (dispatch, options = {}) => {
  const {
    includeAnnotations = true,
    xfdfData,
    externalURL,
  } = options;
  const downloadOptions = { downloadType: 'pdf' };

  if (includeAnnotations) {
    const xfdfString = await core.exportAnnotations();
    downloadOptions.xfdfString = xfdfData || xfdfString;
  }

  dispatch(actions.openElement('loadingModal'));

  const doc = core.getDocument();
  const filename = doc.getFilename();

  if (externalURL) {
    const downloadIframe =
      document.getElementById('download-iframe') ||
      document.createElement('iframe');
    downloadIframe.width = 0;
    downloadIframe.height = 0;
    downloadIframe.id = 'download-iframe';
    downloadIframe.src = null;
    document.body.appendChild(downloadIframe);
    downloadIframe.src = externalURL;
    dispatch(actions.closeElement('loadingModal'));
    fireEvent('finishedSavingPDF');
  } else {
    try {
      const mimeType = { type: 'application/pdf' };
      const data = await doc.getFileData(downloadOptions);
      const arr = new Uint8Array(data);
      const file = isIE ? new Blob([arr], mimeType) : new File([arr], filename, mimeType);

      saveAs(file, filename);
      dispatch(actions.closeElement('loadingModal'));
      fireEvent('finishedSavingPDF');
    } catch (error) {
      dispatch(actions.closeElement('loadingModal'));
      fireError(error.message);
    }
  }
};
