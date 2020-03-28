import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import './ImageUploader.scss';

const propTypes = {
  className: PropTypes.string,
  onAdd: PropTypes.func,
};

const ImageUploader = ({ className = 'image-uploader', onAdd = () => {} }) => {
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
          })
        );

        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      }
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

ImageUploader.propTypes = propTypes;

export default ImageUploader;
