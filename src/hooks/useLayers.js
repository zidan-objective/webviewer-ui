import { useState, useEffect } from 'react';

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

  return [layers, setLayers];
};
