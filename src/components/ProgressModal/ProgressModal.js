import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import core from 'core';
import actions from 'actions';
import selectors from 'selectors';

import './ProgressModal.scss';

const ProgressModal = () => {
  const [isDisabled, isOpen, loadingProgress] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'progressModal'),
      selectors.isElementOpen(state, 'progressModal'),
      selectors.getLoadingProgress(state),
    ],
    shallowEqual,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const onDocumentLoaded = () => {
      dispatch(actions.setLoadingProgress(1));

      // use a setTimeout here to make sure the progress show properly
      setTimeout(() => {
        dispatch(actions.closeElement('progressModal'));
        dispatch(actions.resetLoadingProgress());
      }, 300);
    };

    core.addEventListener('documentLoaded', onDocumentLoaded);
    return () => core.removeEventListener('documentLoaded', onDocumentLoaded);
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) {
      dispatch(
        actions.closeElements([
          'signatureModal',
          'printModal',
          'errorModal',
          'loadingModal',
        ]),
      );
    }
  }, [dispatch, isOpen]);

  return isDisabled ? null : (
    <div
      className={classNames({
        Modal: true,
        ProgressModal: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element="progressModal"
    >
      <div className="container">
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{
              transform: `translateX(${-(1 - loadingProgress) * 100}%`,
              transition: 'transform 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
