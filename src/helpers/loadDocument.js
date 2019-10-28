import { fireError } from 'helpers/fireEvent';

import core from 'core';
import actions from 'actions';

export default (src, options, dispatch) => {
  options.docId = options.documentId || null;
  options.onError = fireError;
  options.onProgress = percent => dispatch(actions.setLoadingProgress(percent));
  options.password = () => {};

  // https://www.pdftron.com/documentation/web/guides/xod-and-encryption/#decrypt-a-document-on-clientside
  // encryption is passed down from WebViewer constructor while decryptionOptions is passed from instance.loadDocument
  // not very sure why we use different names
  const { encryption, decryptOptions } = options;
  if (encryption || decryptOptions) {
    options.xodOptions = {
      decrypt: window.CoreControls.Encryption.decrypt,
      decryptOptions: encryption || decryptOptions,
    };
  }

  core.loadDocument(src, options);

  dispatch(actions.openElement('progressModal'));
};
