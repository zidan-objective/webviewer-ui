
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import core from 'core';
import { isIOS } from 'helpers/device';
import selectors from 'selectors';
import './StampInput.scss';


const StampInput = () => {
  const [currentUser] = useState(core.getCurrentUser());
  const [stampTextInputValue, setStampText] = useState('Draft');
  const [dateCheckbox, setDateCheckbox] = useState(true);
  const [timeCheckbox, setTimeCheckbox] = useState(true);
  const [timeMode, setTimeMode] = useState(false);

  const [formatInput, setFormatInout] = useState(false);

  const [timestampFormat, setTimestampFormat] = useState('lime');


  const canvasRef = useRef();
  const inputRef = useRef();
  const customFormatInputRef = useRef();


  const handleInputChange = e => {
    const value = e.target.value;
    setStampText(value);
    // updateCanvas(value);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');//.scale(multiplier, multiplier);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillText(value, 10, 50);
  };


  const handleDateInputChange = () => {
    setDateCheckbox(!dateCheckbox);
  };

  const handleTimeInputChange = () => {
    setTimeCheckbox(!timeCheckbox);
  };

  const changeTimeMode = () => {
    if (timeMode === false) {
      setFormatInout(false);
      setTimestampFormat('DD/MM/YYYY, h:mm a');
    }
    setTimeMode(!timeMode);
  };

  const changeFormat = e => {
    const value = e.target.value;
    if (value === 'other') {
      setFormatInout(true);
    } else {
      setFormatInout(false);
    }
    setTimestampFormat(value);
  };

  const isEnabled = (timeMode && formatInput);
  useEffect(() => {
    if (isEnabled) {
      customFormatInputRef.current.focus();
    }
  }, [isEnabled]);

  useEffect(() => {
    // const signatureTool = core.getTool('AnnotationCreateSignature');
    const canvas = canvasRef.current;

    // signatureTool.setSignatureCanvas(canvas);
    // const multiplier = window.utils.getCanvasMultiplier();
    const ctx = canvas.getContext('2d');//.scale(multiplier, multiplier);
    ctx.font = '30px Arial';
    ctx.fillText(stampTextInputValue, 10, 50);

  }, []);

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    // signatureTool.setSignatureCanvas(canvas);
    // const multiplier = window.utils.getCanvasMultiplier();
    const ctx = canvas.getContext('2d');//.scale(multiplier, multiplier);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillText(stampTextInputValue, 10, 50);
  });

  const btnLabel = (!timeMode) ? 'Custom' : 'Cancel';
  let dateCheckboxElement = null;
  let timeCheckboxElement = null;

  if (!timeMode) {
    dateCheckboxElement = <div className="custom-checkbox" style={{ width: '20%', alignSelf: 'center' }}>
      <input
        id="default-date"
        type="checkbox"
        checked={dateCheckbox}
        onChange={handleDateInputChange}
      />
      <label htmlFor="default-date">Date</label>
    </div>;

    timeCheckboxElement = <div className="custom-checkbox" style={{ width: '40%', alignSelf: 'center' }}>
      <input
        id="default-time"
        type="checkbox"
        checked={timeCheckbox}
        onChange={handleTimeInputChange}
      />
      <label htmlFor="default-time">Time</label>
    </div>;
  }

  let formatDropdownElement = null;
  if (timeMode && !formatInput) {
    formatDropdownElement = <div className="StyleOption" style={{ width: '60%', alignSelf: 'center' }}>
      <select
        className="styles-input"
        value={timestampFormat}
        onChange={changeFormat}
        style={{ textTransform: 'none', width: '100%' }}
      >
        <option value="DD/MM/YYYY, h:mm a">DD/MM/YYYY, h:mm a</option>
        <option value="[By $currentUser at] h:mm a, MMMM D, YYYY">[By {currentUser} at] h:mm a, MMMM D, YYYY</option>
        <option value="[By $currentUser on] MMMM Do, YYYY">[By {currentUser} on] MMMM Do, YYYY</option>
        <option value="MMMM D, YYYY, h:mm a">MMMM D, YYYY, h:mm a</option>
        <option value="other">other</option>
      </select>
    </div>;
  }
  let formatInputElement = null;
  if (timeMode && formatInput) {
    formatInputElement = <div style={{ width: '60%', alignSelf: 'center' }}>
      <input style={{ width: '100%' }}
        className="text-signature-input"
        ref={customFormatInputRef}
        type="text"
      />
    </div>;
  }

  return (
    <div className="text-signature">
      <div className="canvas-container">
        <div className="canvas-holder">
          <canvas
            className="custom-stamp-canvas"
            ref={canvasRef}
          />
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex' }}>
        <div style={{ width: '20%', alignSelf: 'center' }}> Stamp text: </div>
        <input style={{ width: '80%' }}
          className="text-signature-input"
          ref={inputRef}
          type="text"
          value={stampTextInputValue}
          onChange={handleInputChange}
        />
      </div>

      <div style={{ marginTop: 10, display: 'flex' }}>
        <div style={{ width: '20%', alignSelf: 'center' }}> Timestamp text: </div>
        {dateCheckboxElement}
        {timeCheckboxElement}
        {formatDropdownElement}
        {formatInputElement}
        <div style={{ width: '20%', alignSelf: 'center', textAlign: 'end' }}>
          <button onClick={() => changeTimeMode()} style={{ margin:0 }}>{btnLabel}</button>
        </div>
        {/* <input style={{ width: '80%' }}
          className="text-signature-input"
          ref={timestampInputRef}
          type="text"
          value={timestampTextInputValue}
          onChange={handleTimestampInputChange}
        /> */}
      </div>

    </div>
  );
};

export default StampInput;