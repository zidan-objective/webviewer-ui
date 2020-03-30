import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import ActionButton from 'components/ActionButton';
import Input from 'components/Input';
import ImageUploader from 'components/ImageUploader';

import useOnClickOutside from 'hooks/useOnClickOutside';
import actions from 'actions';
import selectors from 'selectors';

import './CustomStampModal.scss';

const CustomStampModal = () => {
  const [isDisabled, isOpen] = useSelector(state => [
    selectors.isElementDisabled(state, 'customStampModal'),
    selectors.isElementOpen(state, 'customStampModal'),
  ]);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState({ width: '', height: '' });
  const [maintainRatio, setMaintainRatio] = useState(true);
  const containerRef = useRef();
  const aspectRatioRef = useRef(null);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  useOnClickOutside(containerRef, () => {
    dispatch(actions.closeElements(['customStampModal']));
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(
        actions.closeElements([
          'printModal',
          'loadingModal',
          'progressModal',
          'errorModal',
          'signatureModal',
        ])
      );
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (imageSrc) {
      const image = document.createElement('img');

      image.addEventListener('load', () => {
        setImageSize({
          width: image.width,
          height: image.height,
        });
      });

      image.src = imageSrc;
      aspectRatioRef.current = image.width / image.height;
    } else {
      setImageSize({ width: '', height: '' });
    }
  }, [imageSrc]);

  const handleInputChange = e => {
    const newSize = { ...imageSize };
    const value = e.target.value;

    if (e.target.id === 'custom-stamp-width') {
      newSize.width = value;

      if (maintainRatio) {
        newSize.height = newSize.width * aspectRatioRef.current;
      }
    } else if (e.target.id === 'custom-stamp-height') {
      newSize.height = value;

      if (maintainRatio) {
        newSize.width = newSize.height / aspectRatioRef.current;
      }
    }

    setImageSize(newSize);
  };

  return isDisabled ? null : (
    <div
      className={classNames({
        Modal: true,
        CustomStampModal: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element="customStampModal"
    >
      <div className="container" ref={containerRef}>
        <div className="custom-stamp-header">
          <span>Create Custom Stamp</span>
          <ActionButton
            dataElement="customStampModalCloseButton"
            title="action.close"
            img="ic_close_black_24px"
            onClick={() => dispatch(actions.closeElements(['customStampModal']))}
          />
        </div>
        <div className="custom-stamp-body">
          <ImageUploader className="custom-stamp" onChange={setImageSrc} />
          <div className="custom-stamp-size">
            <label htmlFor="custom-stamp-width">Width:</label>
            <input
              id="custom-stamp-width"
              type="number"
              value={imageSize.width}
              onChange={handleInputChange}
              disabled={!imageSrc}
            />
            <label htmlFor="custom-stamp-height">Height:</label>
            <input
              id="custom-stamp-width"
              type="number"
              value={imageSize.height}
              onChange={handleInputChange}
              disabled={!imageSrc}
            />
          </div>
          <Input
            id="custom-stamp-aspect-ratio"
            type="checkbox"
            label="Maintain aspect ratio"
            checked={maintainRatio}
            onChange={e => setMaintainRatio(e.target.checked)}
          />
        </div>
        <div className="custom-stamp-footer">
          <div className="custom-stamp-create">{t('action.create')}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomStampModal;
