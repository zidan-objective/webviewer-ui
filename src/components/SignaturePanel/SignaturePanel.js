import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import ActionButton from 'components/ActionButton';
import Icon from 'components/Icon';

import core from 'core';
import setVerificationResult from 'helpers/setVerificationResult';
// import { PRIORITY_ONE } from 'constants/actionPriority';
import actions from 'actions';
import selectors from 'selectors';

import './SignaturePanel.scss';
import './WidgetInfo.scss';

const propTypes = {
  display: PropTypes.string.isRequired,
};

const SignaturePanel = ({ display }) => {
  const [isDisabled, certificateUrl] = useSelector(state => [
    selectors.isElementDisabled(state, 'signaturePanel'),
    selectors.getCertificateUrl(state),
  ]);
  const [sigWidgets, setSigWidgets] = useState([]);
  const [locatorRect, setLocatorRect] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const onDocumentLoaded = async() => {
      await core.getAnnotationsLoadedPromise();
      const sigWidgets = core
        .getAnnotationsList()
        .filter(annotation => annotation instanceof Annotations.SignatureWidgetAnnotation);

      setSigWidgets(sigWidgets);
    };

    core.addEventListener('documentLoaded', onDocumentLoaded);
    return () => core.removeEventListener('documentLoaded', onDocumentLoaded);
  }, []);

  useEffect(() => {
    if (certificateUrl && sigWidgets.length) {
      setVerificationResult(certificateUrl, sigWidgets, dispatch);
    }
    // may want to hide the spinner here
  }, [certificateUrl, dispatch, sigWidgets]);

  // useEffect(() => {
  //   if (!sigWidgets.length) {
  //     dispatch(actions.disableElements(['signaturePanel', 'signaturePanelButton']), PRIORITY_ONE);
  //   } else {
  //     dispatch(actions.enableElements(['signaturePanel', 'signaturePanelButton']), PRIORITY_ONE);
  //   }
  // }, [dispatch, sigWidgets]);

  const handleInputChange = e => {
    dispatch(actions.setCertificateUrl(e.target.value));
  };

  const jumpToWidget = widget => {
    core.jumpToAnnotation(widget);

    const { scrollLeft, scrollTop } = core.getScrollViewElement();
    const rect = widget.getRect();
    const pageIndex = widget.PageNumber - 1;
    const windowTopLeft = core
      .getDisplayModeObject()
      .pageToWindow({ x: rect.x1, y: rect.y1 }, pageIndex);
    const windowBottomRight = core
      .getDisplayModeObject()
      .pageToWindow({ x: rect.x2, y: rect.y2 }, pageIndex);

    setLocatorRect({
      x1: windowTopLeft.x - scrollLeft,
      y1: windowTopLeft.y - scrollTop,
      x2: windowBottomRight.x - scrollLeft,
      y2: windowBottomRight.y - scrollTop,
    });
  };

  return isDisabled ? null : (
    <div className="Panel SignaturePanel" data-element="signaturePanel" style={{ display }}>
      <div className="certificate">
        <label htmlFor="certificate-input">Certificate: </label>
        <input
          id="certificate-input"
          type="text"
          onChange={handleInputChange}
          value={certificateUrl}
        />
        {/* <ActionButton dataElement="certificateApplyButton" label="Apply" /> */}
      </div>
      {sigWidgets.map((widget, index) => {
        const name = widget.getField().name;
        return (
          <WidgetInfo
            key={index}
            name={name}
            onClick={() => {
              jumpToWidget(widget);
            }}
          />
        );
      })}
      <WidgetLocator rect={locatorRect} />
    </div>
  );
};

SignaturePanel.propTypes = propTypes;

export const WidgetInfo = ({ name, collapsible, onClick = () => {} }) => {
  const verificationResult = useSelector(state => selectors.getVerificationResult(state, name));
  const [isExpanded, setIsExpended] = useState(!collapsible);

  const { VerificationResult, VerificationOptions } = window.PDFNet;
  const { TimeMode } = VerificationOptions;
  const { TrustStatus, DigestStatus, ModificationPermissionsStatus } = VerificationResult;

  const {
    signed,
    signer,
    signTime,
    id,
    verificationStatus,
    digestStatus,
    documentStatus,
    trustStatus,
    permissionStatus,
    disallowedChanges,
    trustVerificationResultString,
    timeOfTrustVerificationEnum,
    trustVerificationTime,
  } = verificationResult;

  const handleArrowClick = e => {
    e.stopPropagation();
    setIsExpended(!isExpanded);
  };

  const renderTitle = () => {
    const badgeIcon =
      digestStatus === DigestStatus.e_digest_invalid
        ? 'digital_signature_error'
        : verificationStatus
          ? 'digital_signature_valid'
          : 'digital_signature_warning';

    return (
      <div className="title">
        {collapsible && (
          <div
            className={classNames({
              arrow: true,
              expanded: isExpanded,
            })}
            onClick={handleArrowClick}
          >
            <Icon glyph="ic_chevron_right_black_24px" />
          </div>
        )}
        <div className="signature-icons">
          <Icon glyph="digital_signature" />
          <Icon glyph={badgeIcon} className="badge" />
        </div>
        <p>
          Signed {signer && ` by ${signer}`} {signTime && ` on ${signTime}`}
        </p>
      </div>
    );
  };

  const renderVerificationStatus = () => {
    return <p>{verificationStatus ? 'Signature is valid.' : 'Signature verification failed.'}</p>;
  };

  const renderDocumentStatus = () => {
    let content;

    switch (documentStatus) {
      case VerificationResult.DocumentStatus.e_no_error:
        content = 'No general error to report.';
        break;
      case VerificationResult.DocumentStatus.e_corrupt_file:
        content = 'SignatureHandler reported file corruption.';
        break;
      case VerificationResult.DocumentStatus.e_unsigned:
        content = 'The signature has not yet been cryptographically signed.';
        break;
      case VerificationResult.DocumentStatus.e_bad_byteranges:
        content = 'SignatureHandler reports corruption in the ByteRanges in the digital signature.';
        break;
      case VerificationResult.DocumentStatus.e_corrupt_cryptographic_contents:
        content = 'SignatureHandler reports corruption in the Contents of the digital signature.';
        break;
    }

    return <p>{content}</p>;
  };

  const renderDigestStatus = () => {
    let content;

    switch (digestStatus) {
      case VerificationResult.DigestStatus.e_digest_invalid:
        content = 'The digest is incorrect.';
        break;
      case VerificationResult.DigestStatus.e_digest_verified:
        content = 'The digest is correct.';
        break;
      case VerificationResult.DigestStatus.e_digest_verification_disabled:
        content = 'Digest verification has been disabled.';
        break;
      case VerificationResult.DigestStatus.e_weak_digest_algorithm_but_digest_verifiable:
        content = 'The digest is correct, but the digest algorithm is weak and not secure.';
        break;
      case VerificationResult.DigestStatus.e_no_digest_status:
        content = 'No digest status to report.';
        break;
      case VerificationResult.DigestStatus.e_unsupported_encoding:
        content = 'No installed SignatureHandler was able to recognize the signature\'s encoding';
        break;
    }

    return <p>{content}</p>;
  };

  const renderTrustStatus = () => {
    let content;

    switch (trustStatus) {
      case TrustStatus.e_trust_verified:
        content = 'Established trust in signer successfully.';
        break;
      case TrustStatus.e_untrusted:
        content = 'Trust could not be established.';
        break;
      case TrustStatus.e_trust_verification_disabled:
        content = 'Trust verification has been disabled.';
        break;
      case TrustStatus.e_no_trust_status:
        content = 'No trust status to report.';
        break;
    }

    return <p>{content}</p>;
  };

  const renderPermissionStatus = () => {
    let content;

    switch (permissionStatus) {
      case ModificationPermissionsStatus.e_invalidated_by_disallowed_changes:
        content =
          'The document has changes that are disallowed by the signature\'s permissions settings.';
        break;
      case ModificationPermissionsStatus.e_has_allowed_changes:
        content =
          'The document has changes that are allowed by the signature\'s permissions settings.';
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

  const renderDisallowedChanges = () => {
    return disallowedChanges.map(({ objnum, type }) => (
      <p key={objnum}>
        Disallowed change: {type}, objnum: {objnum}
      </p>
    ));
  };

  const renderTrustVerification = () => {
    return trustVerificationResultString ? (
      <div>
        <p>Trust verification result: {trustVerificationResultString}</p>
        <p>
          {timeOfTrustVerificationEnum === TimeMode.e_current
            ? 'Trust verification attempted with respect to current time.'
            : timeOfTrustVerificationEnum === TimeMode.e_signing
              ? `Trust verification attempted with respect to signing time: ${trustVerificationTime}`
              : `Trust verification attempted with respect to secure embedded timestamp: ${trustVerificationTime}`}
        </p>
      </div>
    ) : (
      <p>No detailed trust verification result available.</p>
    );
  };

  return (
    <div className="signature-widget-info" onClick={onClick}>
      {signed ? (
        <React.Fragment>
          {renderTitle()}
          {isExpanded && (
            <div className="body">
              {renderVerificationStatus()}
              {renderDocumentStatus()}
              {renderDigestStatus()}
              {renderTrustStatus()}
              {renderPermissionStatus()}
              {renderDisallowedChanges()}
              {renderTrustVerification()}
            </div>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="title">
            <Icon glyph="digital_signature" />
            <p>Unsigned signature field with object number {id}</p>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const WidgetLocator = ({ rect }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const scrollViewContainer = core.getScrollViewElement();
    const handleScroll = () => {
      setShow(false);
    };

    scrollViewContainer.addEventListener('scroll', handleScroll);
    return () => scrollViewContainer.removeEventListener('scroll', handleScroll);
  });

  useEffect(() => {
    if (rect) {
      setTimeout(() => {
        // so that the locator won't disappear because of the scroll
        setShow(true);
      }, 50);

      setTimeout(() => {
        setShow(false);
      }, 700);
    }
  }, [rect]);

  return (
    show &&
    ReactDOM.createPortal(
      <div
        style={{
          position: 'absolute',
          top: rect.y1,
          left: rect.x1,
          width: rect.x2 - rect.x1,
          height: rect.y2 - rect.y1,
          border: '1px solid #00a5e4',
          zIndex: 100,
        }}
      />,
      document.getElementById('app')
    )
  );
};

export default SignaturePanel;
