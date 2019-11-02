import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Outline from 'components/Outline';

import core from 'core';
import selectors from 'selectors';

import './OutlinesPanel.scss';

const propTypes = {
  display: PropTypes.string.isRequired,
};

const OutlinesPanel = ({ display }) => {
  const isDisabled = useSelector(state =>
    selectors.isElementDisabled(state, 'outlinePanel'),
  );
  const [t] = useTranslation();
  const [outlines, setOutlines] = useState([]);

  useEffect(() => {
    const onDocumentLoaded = () => {
      core.getOutlines(setOutlines);
    };

    const onDocumentUnLoaded = () => {
      setOutlines([]);
    };

    core.addEventListener('documentLoaded', onDocumentLoaded);
    core.addEventListener('documentUnloaded', onDocumentUnLoaded);
    return () => {
      core.removeEventListener('documentLoaded', onDocumentLoaded);
      core.removeEventListener('documentUnloaded', onDocumentUnLoaded);
    };
  }, []);

  return isDisabled ? null : (
    <div
      className="Panel OutlinesPanel"
      style={{ display }}
      data-element="outlinesPanel"
    >
      {outlines.length === 0 && (
        <div className="no-outlines">{t('message.noOutlines')}</div>
      )}
      {outlines.map((outline, i) => (
        <Outline key={i} outline={outline} isVisible />
      ))}
    </div>
  );
};

OutlinesPanel.propTypes = propTypes;

export default OutlinesPanel;
