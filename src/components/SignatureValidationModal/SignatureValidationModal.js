import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { WidgetInfo } from 'components/SignaturePanel';

import core from 'core';
import useOnClickOutside from 'hooks/useOnClickOutside';
import actions from 'actions';
import selectors from 'selectors';

import './SignatureValidationModal.scss';

const SignatureValidationModal = () => {
  const [isDisabled, isOpen] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'signatureValidationModal'),
      selectors.isElementOpen(state, 'signatureValidationModal'),
    ],
    shallowEqual
  );
  const [widgetName, setWidgetName] = useState(null);
  const dispatch = useDispatch();
  const containerRef = useRef();

  useOnClickOutside(containerRef, () => {
    dispatch(actions.closeElements(['signatureValidationModal']));
  });

  useEffect(() => {
    const onDigitalSignatureAvailable = widget => {
      setWidgetName(widget.getField().name);
      dispatch(actions.openElements(['signatureValidationModal']));
    };

    core.addEventListener('digitalSignatureAvailable', onDigitalSignatureAvailable);
    return () => core.removeEventListener('digitalSignatureAvailable', onDigitalSignatureAvailable);
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) {
      dispatch(
        actions.closeElements([
          'signatureModal',
          'printModal',
          'errorModal',
          'loadingModal',
          'passwordModal',
        ])
      );
    }
  }, [dispatch, isOpen]);

  return isDisabled ? null : (
    <div
      className={classNames({
        Modal: true,
        SignatureValidationModal: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element="signatureValidationModal"
    >
      <div className="container" ref={containerRef}>
        <div className="validation-header">
          <div className="title">Signature Validation Status</div>
        </div>
        <div className="validation-body">
          {widgetName && <WidgetInfo name={widgetName} />}
        </div>
      </div>
    </div>
  );
};

export default SignatureValidationModal;
