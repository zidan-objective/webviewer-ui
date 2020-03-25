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
  const [widgetName, setWidgetName] = useState(null);
  const [isDisabled, isOpen, verificationResult] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'signatureValidationModal'),
      selectors.isElementOpen(state, 'signatureValidationModal'),
      selectors.getVerificationResult(state, widgetName),
    ],
    shallowEqual
  );
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

  const renderHeader = () => {
    const { digestStatus, verificationStatus } = verificationResult;
    const { DigestStatus } = window.PDFNet.VerificationResult;

    let backgroundColor;
    if (digestStatus === DigestStatus.e_digest_invalid) {
      backgroundColor = 'rgb(255, 121, 121)';
    } else if (verificationStatus) {
      backgroundColor = 'rgb(141, 216, 141)';
    } else {
      backgroundColor = 'rgb(247, 177, 111)';
    }

    return (
      <div className="validation-header" style={{ backgroundColor }}>
        Signature Validation Status
      </div>
    );
  };

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
        {renderHeader()}

        <div className="validation-body">
          {widgetName && <WidgetInfo name={widgetName} collapsible={false} />}
        </div>
      </div>
    </div>
  );
};

export default SignatureValidationModal;
