import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';

import './ProgressModal.scss';

const ProgressModal = () => {
  const [
    isDisabled,
    isOpen,
    loadingProgress,
    uploadProgress,
  ] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'progressModal'),
      selectors.isElementOpen(state, 'progressModal'),
      selectors.getLoadingProgress(state),
      selectors.getUploadProgress(state),
    ],
    shallowEqual,
  );
  const dispatch = useDispatch();

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

  // TODO: fix
  // const progressToUse = isUploading ? uploadProgress : loadingProgress;
  const progressToUse = loadingProgress;

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
              transform: `translateX(${-(1 - progressToUse) * 100}%`,
              transition: progressToUse ? 'transform 0.5s ease' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
