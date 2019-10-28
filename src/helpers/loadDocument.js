import { setCheckPasswordFunction } from 'components/PasswordModal';

import core from 'core';
import { fireError } from 'helpers/fireEvent';
import getWebViewerConstructorOptions from 'helpers/getWebViewerConstructorOptions';
import actions from 'actions';

export default (dispatch, src, options = {}) => {
  options = { ...getDefaultOptions(), ...options };
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

/**
 * Default options are some of the options used to initialize WebViewer, and will be preserved on loadDocument calls.
 * We do this so that users don't need to pass these options every time they call instance.loadDocument
 * For example, if WebViewer is initialized with WebViewer Server, subsequent calls to instance.loadDocument will assume WebViewer Server is used.
 * @ignore
 */
const getDefaultOptions = () => {
  const defaultOptionNames = [
    'startOffline',
    'azureWorkaround',
    'pdftronServer',
    'singleServerMode',
    'forceClientSideInit',
    'disableWebsockets',
    'cacheKey',
    'streaming',
    'subzero',
    'useDownloader',
  ];
  const constructorOptions = getWebViewerConstructorOptions();

  return Object.keys(constructorOptions).reduce((defaultOptions, key) => {
    if (defaultOptionNames.includes(key)) {
      defaultOptions[key] = constructorOptions[key];
    }
    return defaultOptions;
  }, {});
};

/**
 * transform the password argument from a string to a function to hook up UI logic
 * @ignore
 */
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
        console.error(
          'Wrong password has been passed as an argument. WebViewer will open password modal.',
        );
      }

      setCheckPasswordFunction(checkPassword);
      dispatch(actions.openElement('passwordModal'));
    }
  };
};
