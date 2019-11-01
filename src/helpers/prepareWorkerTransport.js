import { workerTypes } from 'constants/types';
import getHashParams from 'helpers/getHashParams';

export default () => {
  const {
    useSharedWorker, // corresponding to the workerTransportPromise constructor option
    preloadWorker,
  } = getHashParams();

  try {
    if (useSharedWorker && window.parent.WebViewer) {
      var workerTransportPromise = window.parent.WebViewer.workerTransportPromise(
        window.frameElement,
      );
      // originally the option was just for the pdf worker transport promise, now it can be an object
      // containing both the pdf and office promises
      if (workerTransportPromise.pdf || workerTransportPromise.office) {
        window.CoreControls.setWorkerTransportPromise(workerTransportPromise);
      } else {
        window.CoreControls.setWorkerTransportPromise({
          pdf: workerTransportPromise,
        });
      }
    }
  } catch (e) {
    console.warn(e);
    if (e.name === 'SecurityError') {
      console.warn('workerTransportPromise option cannot be used with CORS');
    }
  }

  const { PDF, OFFICE, ALL } = workerTypes;

  if (preloadWorker) {
    if (preloadWorker === PDF || preloadWorker === ALL) {
      window.CoreControls.getDefaultBackendType().then(pdfType => {
        window.CoreControls.initPDFWorkerTransports(pdfType);
      });
    }

    if (preloadWorker === OFFICE || preloadWorker === ALL) {
      window.CoreControls.getDefaultBackendType().then(officeType => {
        window.CoreControls.initOfficeWorkerTransports(officeType);
      });
    }
  }
};
