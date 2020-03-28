import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import core from 'core';
import ActionButton from 'components/ActionButton';
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

  const handleImageAdded = file => {
    const fileReader = new FileReader();

    fileReader.onload = e => {
      const imageSrc = e.target.result;
      setImageSrc(imageSrc);
    };

    fileReader.readAsDataURL(file);
  };

  return (
    <div className="image-signature">
      {imageSrc ? (
        <div className="image-signature-image-container">
          <img src={imageSrc} />
          <ActionButton
            dataElement="imageSignatureDeleteButton"
            img="ic_delete_black_24px"
            onClick={() => setImageSrc(null)}
          />
        </div>
      ) : (
        <ImageUploader className="image-signature" onAdd={handleImageAdded} />
      )}
    </div>
  );
};

ImageSignature.propTypes = propTypes;

export default ImageSignature;
