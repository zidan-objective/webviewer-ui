import core from 'core';
import { workerTypes } from 'constants/types';
import getHashParams from 'helpers/getHashParams';

/* eslint-disable camelcase */
export default () => {
  const params = getHashParams();
  let { server_url: serverUrl } = params;
  const { serverUrlHeaders, did } = params;

  if (!serverUrl) {
    return;
  }

  const getAnnotsFromServer = (originalData, callback) => {
    if (window.readerControl.serverFailed) {
      callback(originalData);
      return;
    }
    if (window.readerControl.loadedFromServer) {
      callback('');
      return;
    }

    // make sure we are not getting cached responses
    if (serverUrl.indexOf('?') === -1) {
      serverUrl += `?_=${Date.now()}`;
    } else {
      serverUrl += `&_=${Date.now()}`;
    }

    if (did) {
      serverUrl += `&did=${did}`;
    }

    serverUrl = did ? `${serverUrl}?did=${did}` : serverUrl;

    fetch(serverUrl, {
      headers: serverUrlHeaders,
    })
      .then(response => {
        if (response.ok) {
          return response.text();
        }

        return Promise.reject(response);
      })
      .then(data => {
        if (data !== null && data !== undefined) {
          window.readerControl.loadedFromServer = true;
          callback(data);
        } else {
          window.readerControl.serverFailed = true;
          callback(originalData);
        }
      })
      .catch(e => {
        window.readerControl.serverFailed = true;
        console.warn(
          `Error ${e.status}: Annotations could not be loaded from the server.`,
        );
        callback(originalData);
      });
  };

  core.setInternalAnnotationsTransform(getAnnotsFromServer);
  core.setPagesUpdatedInternalAnnotationsTransform(
    (origData, pages, callback) => {
      getAnnotsFromServer(origData, callback);
    },
  );
  core.addEventListener('documentLoaded', function() {
    if (window.docViewer.getDocument().getType() === workerTypes.OFFICE) {
      getAnnotsFromServer(null, function(data) {
        window.docViewer.getAnnotationManager().importAnnotations(data);
      });
    }
  });
};
