import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import getClassName from 'helpers/getClassName';
import selectors from 'selectors';
import { isIOS } from 'helpers/device';

import './PageNavOverlay.scss';

class PageNavOverlay extends React.PureComponent {
  static propTypes = {
    isLeftPanelDisabled: PropTypes.bool,
    isLeftPanelOpen: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    totalPages: PropTypes.number,
    pageLabels: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.state = {
      input: '',
      currentPage: 1,
      isCustomPageLabels: false,
    };
  }

  componentDidMount() {
    core.addEventListener('pageNumberUpdated', this.onPageNumberUpdated);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.pageLabels !== this.props.pageLabels) {
      const isCustomPageLabels = this.props.pageLabels.some((label, index) => label !== `${index + 1}`);
      this.setState({ isCustomPageLabels });
    }

    if (prevState.currentPage !== this.state.currentPage || prevProps.pageLabels !== this.props.pageLabels) {
      this.setState({ input: this.props.pageLabels[this.state.currentPage - 1] });
    }

    if (prevProps.totalPages !== this.props.totalPages && !this.props.isDisabled) {
      this.setInputWidth();
    }

    if (prevProps.isDisabled && !this.props.isDisabled) {
      this.setInputWidth();
    }
  }

  componentWillUnmount() {
    core.removeEventListener('pageNumberUpdated', this.onPageNumberUpdated);
  }

  onPageNumberUpdated = pageNumber => {
    this.setState({
      currentPage: pageNumber,
    });
  }

  setInputWidth = () => {
    this.textInput.current.style.width = `${this.props.totalPages.toString().length * 11.5}px`;
  }

  onClick = () => {
    if (isIOS) {
      setTimeout(() => {
        this.textInput.current.setSelectionRange(0, 9999);
      }, 0);
    } else {
      this.textInput.current.select();
    }
  }

  onChange = e => {
    if (e.target.value.length > this.props.totalPages.toString().length) {
      return;
    }

    this.setState({ input: e.target.value });
  }

  onSubmit = e => {
    e.preventDefault();

    const { input } = this.state;
    const isValidInput = input === '' || this.props.pageLabels.includes(input);

    if (isValidInput) {
      const pageToGo = this.props.pageLabels.indexOf(input) + 1;
      core.setCurrentPage(pageToGo);
    } else {
      this.textInput.current.blur();
    }
  }

  onBlur = () => {
    const { currentPage } = this.state;
    const { pageLabels } = this.props;

    this.setState({ input: pageLabels[currentPage - 1] });
  }

  render() {
    const { isDisabled, isLeftPanelOpen, isLeftPanelDisabled, totalPages } = this.props;
    if (isDisabled) {
      return null;
    }

    const className = getClassName(`Overlay PageNavOverlay ${isLeftPanelOpen && !isLeftPanelDisabled ? 'shifted' : ''}`, this.props);

    return (
      <div className={className} data-element="pageNavOverlay" onClick={this.onClick}>
        <form onSubmit={this.onSubmit} onBlur={this.onBlur}>
          <input ref={this.textInput} type="text" value={this.state.input} onChange={this.onChange} tabIndex={-1} />
          {this.state.isCustomPageLabels
            ? ` (${this.state.currentPage}/${totalPages})`
            : ` / ${totalPages}`
          }
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isLeftPanelDisabled: selectors.isElementDisabled(state, 'leftPanel'),
  isLeftPanelOpen: selectors.isElementOpen(state, 'leftPanel'),
  isDisabled: selectors.isElementDisabled(state, 'pageNavOverlay'),
  isOpen: selectors.isElementOpen(state, 'pageNavOverlay'),
  totalPages: selectors.getTotalPages(state),
  pageLabels: selectors.getPageLabels(state),
});

export default connect(mapStateToProps)(PageNavOverlay);