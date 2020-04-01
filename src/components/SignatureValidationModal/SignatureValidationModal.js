import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import ActionButton from 'components/ActionButton';
import { SignatureIcon, Spinner } from 'components/SignaturePanel';
// import SignaturePropertyModal from 'components/SignaturePropertyModal';

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
  const [showProperty, setShowProperty] = useState(false);
  const containerRef = useRef();
  const {
    badgeIcon,
    verificationStatus,
    permissionStatus,
    validSignerIdentity,
    signer,
    signTime,
    trustVerificationResultString,
    timeOfTrustVerificationEnum,
    trustVerificationTime,
    digestAlgorithm,
    documentPermission,
    isCertification,
  } = verificationResult;
  const {
    VerificationResult,
    VerificationOptions,
    DigestAlgorithm,
    DigitalSignatureField,
  } = window.PDFNet;
  const {
    TrustStatus,
    DigestStatus,
    ModificationPermissionsStatus,
    DocumentStatus,
  } = VerificationResult;
  const { TimeMode } = VerificationOptions;

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
    } else {
      setShowProperty(false);
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
    } else {
      backgroundColor = '#ddd';
    }

    return (
      <div className="validation-header" style={{ backgroundColor }}>
        {showProperty ? 'Signature Properties' : 'Signature Validation Status'}
        <ActionButton
          dataElement="signatureValidationModalCloseButton"
          title="action.close"
          img="ic_close_black_24px"
          onClick={() => dispatch(actions.closeElements(['signatureValidationModal']))}
        />
      </div>
    );
  };

  const renderValidationStatus = () => {
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

    return (
      <React.Fragment>
        <p style={{ fontSize: '1.1em' }}>
          {verificationStatus ? 'Signature is valid.' : 'Signature validity is unknown.'}
        </p>
        {renderPermissionStatus()}
        <p>
          {validSignerIdentity
            ? `- The signer's identity is valid.`
            : `- The signer's identity is unknown.`}
        </p>
      </React.Fragment>
    );
  };

  const renderProperties = () => {
    const renderPermissionStatus = () => {
      let content;

      switch (permissionStatus) {
        case ModificationPermissionsStatus.e_invalidated_by_disallowed_changes:
          content = `The document has changes that are disallowed by the signature's permissions settings.`;
          break;
        case ModificationPermissionsStatus.e_has_allowed_changes:
          content = `The document has changes that are allowed by the signature's permissions settings.`;
          break;
        case ModificationPermissionsStatus.e_unmodified:
          content = 'The document has not been modified since it was signed.';
          break;
        case ModificationPermissionsStatus.e_permissions_verification_disabled:
          content = 'Permissions verification has been disabled.';
          break;
        case ModificationPermissionsStatus.e_no_permissions_status:
          content = 'No permissions status to report.';
          break;
      }

      return <p>{content}</p>;
    };

    const renderDocumentPermission = () => {
      if (!documentPermission) {
        return;
      }

      let content;

      switch (documentPermission) {
        case DigitalSignatureField.DocumentPermissions.e_no_changes_allowed:
          content = `The ${
            isCertification ? 'certifier' : 'signer'
          } has specified that no changes are allowed for this document.`;
          break;
        case DigitalSignatureField.DocumentPermissions.e_formfilling_signing_allowed:
          content = `The ${
            isCertification ? 'certifier' : 'signer'
          } has specified that Form Fill-in and Signing are allowed for this document. No other changes are permitted.`;
          break;
        case DigitalSignatureField.DocumentPermissions.e_annotating_formfilling_signing_allowed:
          content = `The ${
            isCertification ? 'certifier' : 'signer'
          } has specified that Form Fill-in, Signing and Commenting are allowed for this document. No other changes are permitted.`;
          break;
        case DigitalSignatureField.DocumentPermissions.e_unrestricted:
          content = `The ${
            isCertification ? 'certifier' : 'signer'
          } has specified that there are no restrictions for this document.`;
          break;
      }

      return <p>{content}</p>;
    };

    const renderTrustVerification = () => {
      return trustVerificationResultString ? (
        <p>
          {timeOfTrustVerificationEnum === TimeMode.e_current
            ? 'Trust verification attempted with respect to current time.'
            : timeOfTrustVerificationEnum === TimeMode.e_signing
            ? `Trust verification attempted with respect to signing time: ${trustVerificationTime}`
            : `Trust verification attempted with respect to secure embedded timestamp: ${trustVerificationTime}`}
        </p>
      ) : (
        <p>No detailed trust verification result available.</p>
      );
    };

    const renderDigestAlgorithm = () => {
      let content;

      switch (digestAlgorithm) {
        case DigestAlgorithm.Type.e_SHA1:
          content = `The digest algorithm that was used to sign the signature: SHA1.`;
          break;
        case DigestAlgorithm.Type.e_SHA256:
          content = `The digest algorithm that was used to sign the signature: SHA256.`;
          break;
        case DigestAlgorithm.Type.e_SHA384:
          content = 'The digest algorithm that was used to sign the signature: SHA384.';
          break;
        case DigestAlgorithm.Type.e_SHA512:
          content = 'The digest algorithm that was used to sign the signature: SHA512.';
          break;
        case DigestAlgorithm.Type.e_RIPEMD160:
          content = 'The digest algorithm that was used to sign the signature: RIPEMD160.';
          break;
        case DigestAlgorithm.Type.e_unknown_digest_algorithm:
          content = 'The digest algorithm that was used to sign the signature is unknown.';
          break;
      }

      return <p>{content}</p>;
    };

    let verificationContent = verificationStatus
      ? `Signature is valid`
      : 'Signature validity is unknown';
    verificationContent = signer
      ? `${verificationContent}, signed by ${signer}.`
      : `${verificationContent}.`;

    return (
      <React.Fragment>
        <p style={{ fontSize: '1.1em' }}>{verificationContent}</p>
        {signTime && <p>Signing Time: {signTime}</p>}
        {renderPermissionStatus()}
        {renderDocumentPermission()}
        <p>
          {validSignerIdentity
            ? `The signer's identity is valid.`
            : `The signer's identity is unknown.`}
        </p>
        {renderTrustVerification()}
        {renderDigestAlgorithm()}
      </React.Fragment>
    );
  };

  const waitingForVerification = typeof verificationStatus === 'undefined';

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

        {waitingForVerification ? (
          <div className="center">
            <Spinner />
          </div>
        ) : (
          <React.Fragment>
            <div className="validation-body">
              <SignatureIcon badge={badgeIcon} />
              <div className="inner">
                {showProperty ? renderProperties() : renderValidationStatus()}
              </div>
            </div>

            <div className="validation-footer">
              <ActionButton
                label={showProperty ? 'Validation status' : 'Signature properties'}
                dataElement="signaturePropertiesButton"
                onClick={() => {
                  setShowProperty(!showProperty);
                }}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default SignatureValidationModal;
