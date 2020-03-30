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
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const containerRef = useRef();

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
          <ImageUploader className="custom-stamp" />
          <div className="custom-stamp-size">
            <label htmlFor="custom-stamp-width">Width:</label>
            <input id="custom-stamp-width" type="text" />
            <label htmlFor="custom-stamp-height">Height:</label>
            <input id="custom-stamp-width" type="text" />
          </div>
          <Input
            id="custom-stamp-aspect-ratio"
            type="checkbox"
            label="Maintain aspect ratio"
            defaultChecked
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
