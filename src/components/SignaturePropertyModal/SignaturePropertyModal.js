import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import useOnClickOutside from 'hooks/useOnClickOutside';
import actions from 'actions';
import selectors from 'selectors';

import './SignaturePropertyModal.scss';

const SignaturePropertyModal = ({ setShow, verificationResult }) => {
  const isDisabled = useSelector(
    state => selectors.isElementDisabled(state, 'signaturePropertyModal'),
    shallowEqual
  );
  const containerRef = useRef();

  useOnClickOutside(containerRef, () => {
    setShow(false);
  });

  return isDisabled ? null : (
    <div
      className={classNames({
        Modal: true,
        SignaturePropertyModal: true,
        open: true,
      })}
      data-element="signaturePropertyModal"
    >
      <div className="container" ref={containerRef}>
        adsfadsf
      </div>
    </div>
  );
};

export default SignaturePropertyModal;
