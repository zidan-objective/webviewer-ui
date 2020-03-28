import React, { useState, useEffect, useRef } from 'react';
import PropTypes, { oneOf } from 'prop-types';
import { useTranslation } from 'react-i18next';

import core from 'core';
import ActionButton from 'components/ActionButton';

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

const ImageUploader = ({ className = 'image-uploader', onAdd, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef();
  const [t] = useTranslation();
  const acceptedFileTypes = ['png', 'jpg', 'jpeg'];

  const handleDragEnter = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDragLeave = e => {
    e.preventDefault();

    if (!e.target.parentNode.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragExit = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const { files } = e.dataTransfer;

    if (files.length) {
      const file = files[0];
      const isValid = acceptedFileTypes.some(type => file.type === `image/${type}`);

      if (isValid) {
        onAdd(file);
      } else {
        setErrorMessage(
          t('message.imageSignatureAcceptedFileTypes', {
            acceptedFileTypes: acceptedFileTypes.join(', '),
          }),
        );

        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      }

      onAdd(files[0]);
    }
  };

  return (
    <div
      className={`${className}-upload-container`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
      onDragExit={handleDragExit}
    >
      <div className={`${className}-dnd`}>{t('option.signatureModal.dragAndDrop')}</div>
      <div className={`${className}-separator`}>{t('option.signatureModal.or')}</div>
      <div className={`${className}-upload`}>
        <input
          ref={fileInputRef}
          id="upload"
          type="file"
          accept={acceptedFileTypes.map(type => `.${type}`).join(',')}
          onChange={e => onAdd(e.target.files[0])}
        />
        <button onClick={() => fileInputRef.current.click()}>
          {t('option.signatureModal.pickImage')}
        </button>
      </div>
      {isDragging && <div className={`${className}-background`} />}
      {errorMessage && <div className={`${className}-error`}>{errorMessage}</div>}
    </div>
  );
};

ImageSignature.propTypes = propTypes;

export default ImageSignature;
