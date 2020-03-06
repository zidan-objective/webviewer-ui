import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import ActionButton from 'components/ActionButton';
import actions from 'actions';
import selectors from 'selectors';
import core from 'core';

import './SignatureValidationModal.scss';

const SignatureValidationModal = () => {
  const [isDisabled, isOpen] = useSelector(
    state => [
      selectors.isElementDisabled(state, 'signatureValidationModal'),
      selectors.isElementOpen(state, 'signatureValidationModal'),
    ],
    shallowEqual,
  );
  const dispatch = useDispatch();
  const [canBeVerified, setCanBeVerified] = useState(false);
  const [signer, setSigner] = useState('');
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(
        actions.closeElements([
          'signatureModal',
          'printModal',
          'errorModal',
          'loadingModal',
          'passwordModal',
        ]),
      );
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    const onDigitalSignatureAvailable = async widget => {
      if (!window.CoreControls.isFullPDFEnabled()) {
        return;
      }

      await window.PDFNet.initialize(undefined, 'ems');

      const pdfDoc = await window.docViewer.getDocument().getPDFDoc();
      const fieldName = widget.getField().name;
      const field = await pdfDoc.getDigitalSignatureField(fieldName);

      const opts = await window.PDFNet.VerificationOptions.create(window.PDFNet.VerificationOptions.SecurityLevel.e_compatibility_and_archiving);
      const result = await field.verify(opts);

      setCanBeVerified(await result.getVerificationStatus());
      setSigner((await field.getSignatureName()) || (await field.getContactInfo()));
      setPermissionStatus(await result.getPermissionsStatus());

      dispatch(actions.openElements(['signatureValidationModal']));
    };

    core.addEventListener('digitalSignatureAvailable', onDigitalSignatureAvailable);
    return () => core.removeEventListener('digitalSignatureAvailable', onDigitalSignatureAvailable);
  }, [dispatch]);

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
      <div className="container">
        <div className="validation-header">
          <div className="title">Signature Validation Status</div>
          <ActionButton
            dataElement="signatureValidationModalCloseButton"
            title="action.close"
            img="ic_close_black_24px"
            onClick={() => dispatch(actions.closeElements(['signatureValidationModal']))}
          />
        </div>
        <div className="body">
          {canBeVerified ? '✅ Signature is valid.' : '⚠️ Signature verification failed.'}
          {signer && `Signed by: ${signer}`}
        </div>
      </div>
    </div>
  );
};

export default SignatureValidationModal;
