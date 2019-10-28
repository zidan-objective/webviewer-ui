import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import core from 'core';
import { workerTypes } from 'constants/types';
import selectors from 'selectors';

import './PrintHandler.scss';

const PrintHandler = () => {
  const [isDisabled, isEmbedPrintSupported] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'printHandler'),
      selectors.isEmbedPrintSupported(state),
    ],
    shallowEqual,
  );
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    const onDocumentLoaded = () => {
      const type = core.getDocument().getType();
      setDocumentType(type);
    };

    core.addEventListener('documentLoaded', onDocumentLoaded);
    return () => core.removeEventListener('documentLoaded', onDocumentLoaded);
  });

  return isDisabled ? null : (
    <div className="PrintHandler">
      {isEmbedPrintSupported && documentType === workerTypes.PDF ? (
        <iframe id="print-handler" tabIndex={-1}></iframe>
      ) : (
        <div id="print-handler"></div>
      )}
    </div>
  );
};

export default PrintHandler;
