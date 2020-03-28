import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Tabs, Tab, TabPanel } from 'components/Tabs';
import ActionButton from 'components/ActionButton';
import Button from 'components/Button';
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
        <Tabs id="customStampModal">
          <div className="header">
            <div className="tab-list">
              <Tab dataElement="customStampFilePanelButton">
                <Button label={t('action.upload')} />
              </Tab>
              <Tab dataElement="customStampUrlPanelButton">
                <Button label={t('link.url')} />
              </Tab>
            </div>
            <ActionButton
              dataElement="customStampModalCloseButton"
              title="action.close"
              img="ic_close_black_24px"
              onClick={() => dispatch(actions.closeElements(['customStampModal']))}
            />
          </div>

          <TabPanel dataElement="customStampFilePanel">
            <ImageUploader />
          </TabPanel>
          <TabPanel dataElement="customStampUrlPanel">Hello again</TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomStampModal;
