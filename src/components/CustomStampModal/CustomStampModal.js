import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

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
  const containerRef = useRef();

  useOnClickOutside(containerRef, () => {
    console.log('here');
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
        Hello!
      </div>
    </div>
  );
};

export default CustomStampModal;
