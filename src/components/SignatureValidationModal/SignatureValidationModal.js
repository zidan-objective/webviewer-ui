import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import ActionButton from 'components/ActionButton';
import { SignatureIcon } from 'components/SignaturePanel';

import core from 'core';
import useOnClickOutside from 'hooks/useOnClickOutside';
import actions from 'actions';
import selectors from 'selectors';

import './SignatureValidationModal.scss';
// import '../SignaturePanel/SignatureIcon.scss';

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
  const {
    badgeIcon,
    verificationStatus,
    permissionStatus,
    validSignerIdentity,
  } = verificationResult;
  const { VerificationResult, VerificationOptions } = window.PDFNet;
  const {
    TrustStatus,
    DigestStatus,
    ModificationPermissionsStatus,
    DocumentStatus,
  } = VerificationResult;

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
    let backgroundColor;
    if (badgeIcon === 'digital_signature_error') {
      backgroundColor = 'rgb(255, 121, 121)';
    } else if (badgeIcon === 'digital_signature_valid') {
      backgroundColor = 'rgb(141, 216, 141)';
    } else if (badgeIcon === 'digital_signature_warning') {
      backgroundColor = 'rgb(247, 177, 111)';
    }

    return (
      <div className="validation-header" style={{ backgroundColor }}>
        Signature Validation Status
        <ActionButton
          dataElement="signatureValidationModalCloseButton"
          title="action.close"
          img="ic_close_black_24px"
          onClick={() => dispatch(actions.closeElements(['signatureValidationModal']))}
        />
      </div>
    );
  };

  const renderPermissionStatus = () => {
    let content;

    switch (permissionStatus) {
      case ModificationPermissionsStatus.e_invalidated_by_disallowed_changes:
        content = `- The document has changes that are disallowed by the signature's permissions settings.`;
        break;
      case ModificationPermissionsStatus.e_has_allowed_changes:
        content = `- The document has changes that are allowed by the signature's permissions settings.`;
        break;
      case ModificationPermissionsStatus.e_unmodified:
        content = '- The document has not been modified since it was signed.';
        break;
      case ModificationPermissionsStatus.e_permissions_verification_disabled:
        content = '- Permissions verification has been disabled.';
        break;
      case ModificationPermissionsStatus.e_no_permissions_status:
        content = '- No permissions status to report.';
        break;
    }

    return <p>{content}</p>;
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
          <SignatureIcon badge={badgeIcon} />
          <div className="status">
            <p style={{ fontSize: '1.1em' }}>
              {verificationStatus ? 'Signature is valid.' : 'Signature validity is unknown.'}
            </p>
            {renderPermissionStatus()}
            <p>
              {validSignerIdentity
                ? `- The signer's identity is valid.`
                : `- The signer's identity is unknown.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureValidationModal;
