import Icon from 'components/Icon';
import core from 'core';
import { isIOS } from 'helpers/device';
import getClassName from 'helpers/getClassName';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import selectors from 'selectors';
import './PageNavOverlay.scss';

/* eslint-disable jsx-a11y/click-events-have-key-events */

const propTypes = {
  isLeftPanelDisabled: PropTypes.bool,
  isLeftPanelOpen: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  pageLabels: PropTypes.array.isRequired,
  allowPageNavigation: PropTypes.bool.isRequired,
};

function PageNavOverlay(props) {
  const textInput = useRef(null);

  const [isCustomPageLabels, setIsCustomPageLabels] = useState(false);
  useEffect(() => {
    const hasCustomLabels = props.pageLabels.some(
      (label, index) => label !== `${index + 1}`,
    );
    setIsCustomPageLabels(hasCustomLabels);
  }, [props.pageLabels]);

  const [input, setInput] = useState('');
  useEffect(() => {
    if (Array.isArray(props.pageLabels) && !props.pageLabels.length) {
      return;
    }
    setInput(props.pageLabels[props.currentPage - 1]);
  }, [props.currentPage, props.pageLabels]);

  const [disabled, setDisabled] = useState({ prev: true, next: false });
  useEffect(() => {
    setDisabled(old => {
      const prev = Number(input) === 1;
      const next = Number(input) === window.docViewer.getPageCount();

      if (old.prev === prev && old.next === next) {
        return old;
      }
      return { prev, next };
    });
  }, [input]);

  const onSelectText = () => {
    if (isIOS) {
      setTimeout(() => {
        textInput.current.setSelectionRange(0, 9999);
      }, 0);
    } else {
      textInput.current.select();
    }
  };

  const onChange = e => {
    if (e.target.value.length > props.totalPages.toString().length) {
      return;
    }

    setInput(e.target.value);
  };

  const onSubmit = e => {
    e.preventDefault();

    const isValidInput = input === '' || props.pageLabels.includes(input);

    if (isValidInput) {
      const pageToGo = props.pageLabels.indexOf(input) + 1;
      core.setCurrentPage(pageToGo);
    }

    onSelectText();
  };

  const onBlur = () => {
    setInput(props.pageLabels[props.currentPage - 1]);
  };

  const inputWidth = input.length * 8;

  const className = getClassName(`Overlay PageNavOverlay`, props);

  return (
    <div className={className} data-element="pageNavOverlay">
      <button
        type="button"
        className="down-arrow-container down-arrow-container--left"
        disabled={disabled.prev}
        onClick={() =>
          window.docViewer.setCurrentPage(
            Math.max(window.docViewer.getCurrentPage() - 1, 1),
          )
        }
      >
        <Icon className="down-arrow" glyph="icon-chevron-left" />
      </button>
      <div
        className="formContainer"
        onClick={onSelectText}
        role="button"
        tabIndex={-1}
      >
        <form onSubmit={onSubmit} onBlur={onBlur}>
          <input
            ref={textInput}
            type="number"
            value={input}
            onChange={onChange}
            disabled={!props.allowPageNavigation}
            style={{ width: inputWidth }}
          />
          {isCustomPageLabels
            ? ` (${props.currentPage}/${props.totalPages})`
            : ` / ${props.totalPages}`}
        </form>
      </div>
      <button
        type="button"
        className="down-arrow-container down-arrow-container--right"
        disabled={disabled.next}
        onClick={() =>
          window.docViewer.setCurrentPage(
            Math.min(
              window.docViewer.getCurrentPage() + 1,
              window.docViewer.getPageCount(),
            ),
          )
        }
      >
        <Icon className="down-arrow" glyph="icon-chevron-right" />
      </button>
    </div>
  );
}

PageNavOverlay.propTypes = propTypes;

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pageNavOverlay'),
  isOpen: selectors.isElementOpen(state, 'pageNavOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
  pageLabels: selectors.getPageLabels(state),
  allowPageNavigation: selectors.getAllowPageNavigation(state),
});

export default connect(mapStateToProps)(PageNavOverlay);
