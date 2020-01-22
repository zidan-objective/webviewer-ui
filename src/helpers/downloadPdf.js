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
    const doc = core.getDocument();
    if (includeAnnotations) {
      downloadOptions.xfdfString = xfdfData || xfdfString;
    }
    if (doc.getType() === 'office') {
      downloadOptions.downloadType = 'office';
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
      return doc.getFileData(downloadOptions).then(async data => {
        const arr = new Uint8Array(data);
        const mimeType = { type: 'application/pdf' };
        if (isIE) {
          file = new Blob([arr], mimeType);
        } else {
          file = new File([arr], downloadName, mimeType);
        }

        saveAs(file, downloadName);
        dispatch(actions.closeElement('loadingModal'));
        fireEvent('finishedSavingPDF');
      }, async error => {
        dispatch(actions.closeElement('loadingModal'));
        throw new Error(error.message);
      });
    }
  }).catch(() => {
    dispatch(actions.closeElement('loadingModal'));
  });
};
