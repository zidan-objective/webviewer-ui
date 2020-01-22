import { saveAs } from 'file-saver';

import core from 'core';
import { isIE } from 'helpers/device';
import fireEvent from 'helpers/fireEvent';
import actions from 'actions';

export default (dispatch, options) => {
  const { documentPath = 'document', filename, includeAnnotations = true, xfdfData, externalURL } = options;
  const downloadOptions = { downloadType: 'pdf' };
  let file;

  dispatch(actions.openElement('loadingModal'));

  return core.exportAnnotations().then(async xfdfString => {
    if (includeAnnotations) {
      downloadOptions.xfdfString = xfdfData || xfdfString;
    }

    const getDownloadFilename = (name, extension) => {
      if (name && name.slice(-extension.length).toLowerCase() !== extension) {
        name += extension;
      }
      return name;
    };

    const name = filename || documentPath.split('/').slice(-1)[0];
    const extension = name.split('.');
    const downloadName = getDownloadFilename(name, `.${extension[extension.length - 1]}`);

    const doc = core.getDocument();
    if (externalURL) {
      const downloadIframe = document.getElementById('download-iframe') || document.createElement('iframe');
      downloadIframe.width = 0;
      downloadIframe.height = 0;
      downloadIframe.id = 'download-iframe';
      downloadIframe.src = null;
      document.body.appendChild(downloadIframe);
      downloadIframe.src = externalURL;
      dispatch(actions.closeElement('loadingModal'));
      fireEvent('finishedSavingPDF');
    } else {
      // downloadOptions.downloadType = 'office';
      return doc.getFileData(downloadOptions).then(async data => {
        const arr = new Uint8Array(data);
        const mimeType = { type: 'application/pdf' };
        if (isIE) {
          file = new Blob([arr], mimeType);
        } else {
          file = new File([arr], downloadName, mimeType);
        }

        saveAs(file, downloadName);
        // await doc.removePages([doc.getPageCount()]);
        dispatch(actions.closeElement('loadingModal'));
        fireEvent('finishedSavingPDF');
      }, async error => {
        // await doc.removePages([doc.getPageCount()]);
        dispatch(actions.closeElement('loadingModal'));
        throw new Error(error.message);
      });
    }
  }).catch(() => {
    dispatch(actions.closeElement('loadingModal'));
  });
};
