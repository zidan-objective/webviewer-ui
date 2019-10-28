import { fireError } from 'helpers/fireEvent';

import { setCheckPasswordFunction } from 'components/PasswordModal';

import core from 'core';
import actions from 'actions';

export default (src, options, dispatch) => {
  options.docId = options.documentId || null;
  options.onError = fireError;
  options.onProgress = percent => dispatch(actions.setLoadingProgress(percent));
  options.password = transformPasswordOption(options.password, dispatch);

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

// transform the password argument from a string to a function to hook up UI logic
const transformPasswordOption = (password, dispatch) => {
  // a boolean that is used to prevent infinite loop when wrong password is passed as an argument
  let passwordChecked = false;
  let attempt = 0;

  return checkPassword => {
    dispatch(actions.setPasswordAttempts(attempt++));

    if (!passwordChecked && typeof password === 'string') {
      checkPassword(password);
      passwordChecked = true;
    } else {
      if (passwordChecked) {
        console.error('Wrong password has been passed as an argument. WebViewer will open password modal.');
      }

      setCheckPasswordFunction(checkPassword);
      dispatch(actions.openElement('passwordModal'));
    }
  };
};
