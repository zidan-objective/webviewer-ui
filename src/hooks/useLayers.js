import { useState, useEffect } from 'react';

import useDidUpdate from 'hooks/useDidUpdate';
import core from 'core';

export default () => {
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    const onDocumentLoaded = () => {
      const doc = core.getDocument();

      if (!doc.isWebViewerServerDocument()) {
        doc.getLayersArray().then(setLayers);
      }
    };

    core.addEventListener('documentLoaded', onDocumentLoaded);
    return () => core.removeEventListener('documentLoaded', onDocumentLoaded);
  }, []);

  useDidUpdate(() => {
    const doc = core.getDocument();

    if (doc) {
      console.log('no');
      doc.setLayersArray(layers);
      window.docViewer.refreshAll();
      window.docViewer.updateView();
    }
  }, [layers]);

  return [layers, setLayers];
};
