import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';

import App from 'components/App';

import core from 'core';
import defaultTool from 'constants/defaultTool';
import loadCustomCSS from 'helpers/loadCustomCSS';
import loadScript, { loadConfig } from 'helpers/loadScript';
import setupLoadAnnotationsFromServer from 'helpers/setupLoadAnnotationsFromServer';
import eventHandler from 'helpers/eventHandler';
import setupI18n from 'helpers/setupI18n';
import setAutoSwitch from 'helpers/setAutoSwitch';
import setDefaultDisabledElements from 'helpers/setDefaultDisabledElements';
import setupDocViewer from 'helpers/setupDocViewer';
import setDefaultToolStyles from 'helpers/setDefaultToolStyles';
import logDebugInfo from 'helpers/logDebugInfo';
import prepareWorkerTransport from 'helpers/prepareWorkerTransport';
import getHashParams from 'helpers/getHashParams';
import createStore from 'src/redux';

if (window.CanvasRenderingContext2D) {
  const {
    pdfnet,
    subzero = false,
    user = 'Guest',
    admin = false,
  } = getHashParams();
  let fullAPIReady = Promise.resolve();

  if (pdfnet) {
    window.CoreControls.enableFullPDF(true);
    fullAPIReady = loadScript('../core/pdf/PDFNet.js');
  }

  window.CoreControls.enableSubzero(subzero);
  window.CoreControls.setWorkerPath('../core');
  window.CoreControls.setResourcesPath('../core/assets');

  const store = createStore();

  prepareWorkerTransport(store);

  loadCustomCSS();

  logDebugInfo();

  fullAPIReady.then(loadConfig).then(() => {
    const { addEventHandlers, removeEventHandlers } = eventHandler(store);

    const docViewer = new window.CoreControls.DocumentViewer();
    window.docViewer = docViewer;

    core.setToolMode(defaultTool);
    core.setCurrentUser(user);
    core.setIsAdminUser(admin);

    setupDocViewer();
    setupI18n();
    // setupMIMETypeTest(store);
    setAutoSwitch();
    addEventHandlers();
    setDefaultDisabledElements(store);
    setupLoadAnnotationsFromServer();
    setDefaultToolStyles();

    ReactDOM.render(
      <Provider store={store}>
        <I18nextProvider i18n={i18next}>
          <App removeEventHandlers={removeEventHandlers} />
        </I18nextProvider>
      </Provider>,
      document.getElementById('app'),
    );
  });
}

window.addEventListener('hashchange', () => {
  window.location.reload();
});
