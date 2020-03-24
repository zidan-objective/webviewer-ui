import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import ActionButton from 'components/ActionButton';

import core from 'core';
import { PRIORITY_ONE } from 'constants/actionPriority';
import actions from 'actions';
import selectors from 'selectors';

import './SignaturePanel.scss';

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
    if (!sigWidgets.length) {
      dispatch(actions.disableElements(['signaturePanel', 'signaturePanelButton']), PRIORITY_ONE);
    } else {
      dispatch(actions.enableElements(['signaturePanel', 'signaturePanelButton']), PRIORITY_ONE);
    }
  }, [dispatch, sigWidgets]);

  const handleChange = e => {
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
      {core.isFullPDFEnabled() && (
        <div className="certificate">
          <label htmlFor="certificate-input">Certificate: </label>
          <input
            id="certificate-input"
            type="text"
            onChange={handleChange}
            value={certificateUrl}
          />
          <ActionButton dataElement="certificateApplyButton" label="Apply" />
        </div>
      )}
      {sigWidgets.map((widget, index) => {
        return (
          <WidgetInfo
            key={index}
            widget={widget}
            onClick={() => {
              jumpToWidget(widget);
            }}
          />
        );
        // const fieldName = widget.getField().name;
        // console.log(object);

        // return <div key={`${name}-${index}`}>{fieldName}</div>;
      })}
      <WidgetLocator rect={locatorRect} />
    </div>
  );
};

SignaturePanel.propTypes = propTypes;

const WidgetInfo = ({ widget, onClick }) => {
  console.log('123');

  return <div onClick={onClick}>Hello</div>;
};

const WidgetLocator = ({ rect }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (rect) {
      setShow(true);

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
