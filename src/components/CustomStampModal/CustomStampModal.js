import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import core from 'core';
import defaultTool from 'constants/defaultTool';
import actions from 'actions';
import selectors from 'selectors';
import './CustomStampModal.scss';

import Button from 'components/Button';
import ActionButton from 'components/ActionButton';
import StampInput from './StampInput';

const CustomStampModal = () => {
  // const isOpen = true;

  const [isOpen] = useSelector(state => [
    // selectors.isElementDisabled(state, 'customStampModal'),
    // selectors.isElementDisabled(state, 'saveSignatureButton'),
    selectors.isElementOpen(state, 'customStampModal'),
  ]);
  const dispatch = useDispatch();
  const closeModal = () => {
    dispatch(actions.closeElement('customStampModal'));
  };
  const createCustomStamp =() => {

  }
  const modalClass = classNames({
    Modal: true,
    CustomStampModal: true,
    open: isOpen,
    closed: !isOpen,
  });

  return (
    <div
      className={modalClass}
      data-element="customStampModal"
      onMouseDown={closeModal}
    >
      <div className="container" onMouseDown={e => e.stopPropagation()}>
        <div className="header">
          {/* <div>Custom Stamp</div> */}
          <ActionButton
            dataElement="customStampModalCloseButton"
            title="action.close"
            img="ic_close_black_24px"
            onClick={closeModal}
          />

        </div>
        <StampInput isModalOpen={isOpen}/>
        <div
          className="footer"

        >
          <div className="stamp-create" onClick={createCustomStamp}>
            {'Cancel'}
          </div>
          <div className="stamp-create" onClick={createCustomStamp}>
            {'Create'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomStampModal;
