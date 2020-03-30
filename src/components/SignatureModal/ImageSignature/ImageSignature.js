import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import core from 'core';
import ImageUploader from 'components/ImageUploader';

import './ImageSignature.scss';

const propTypes = {
  isModalOpen: PropTypes.bool,
  _setSaveSignature: PropTypes.func.isRequired,
  isTabPanelSelected: PropTypes.bool,
};

const ImageSignature = ({ isModalOpen, _setSaveSignature, isTabPanelSelected }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const signatureTool = core.getTool('AnnotationCreateSignature');

    if (isModalOpen && isTabPanelSelected) {
      _setSaveSignature(!!imageSrc);
      signatureTool.setSignature(imageSrc);
    }
  }, [imageSrc, isTabPanelSelected, _setSaveSignature, isModalOpen]);

  return <ImageUploader className="image-signature" onChange={setImageSrc} />;
};

ImageSignature.propTypes = propTypes;

export default ImageSignature;
