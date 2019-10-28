import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';

import ActionButton from 'components/ActionButton';

import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import print from 'helpers/print';
import getClassName from 'helpers/getClassName';
import openFilePicker from 'helpers/openFilePicker';
import toggleFullscreen from 'helpers/toggleFullscreen';
import downloadPdf from 'helpers/downloadPdf';
import { isIOS } from 'helpers/device';
import core from 'core';
import actions from 'actions';
import selectors from 'selectors';

import './MenuOverlay.scss';

class MenuOverlay extends React.PureComponent {
  static propTypes = {
    isEmbedPrintSupported: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    closeElements: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.overlay = React.createRef();
    this.state = {
      left: 0,
      right: 'auto',
      documentType: '',
      isFullScreen: !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      ),
    };
  }

  componentDidMount() {
    core.addEventListener('documentLoaded', this.onDocumentLoaded);
    document.addEventListener('fullscreenchange', this.onFullScreenChange);
    document.addEventListener('mozfullscreenchange', this.onFullScreenChange);
    document.addEventListener(
      'webkitfullscreenchange',
      this.onFullScreenChange,
    );
    document.addEventListener('MSFullscreenChange', this.onFullScreenChange);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements([
        'groupOverlay',
        'viewControlsOverlay',
        'searchOverlay',
        'toolStylePopup',
        'signatureOverlay',
        'zoomOverlay',
        'redactionOverlay',
      ]);
      this.setState(getOverlayPositionBasedOn('menuButton', this.overlay));
    }
  }

  componentWillUnmount() {
    core.removeEventListener('documentLoaded', this.onDocumentLoaded);
    document.removeEventListener('fullscreenchange', this.onFullScreenChange);
    document.removeEventListener(
      'mozfullscreenchange',
      this.onFullScreenChange,
    );
    document.removeEventListener(
      'webkitfullscreenchange',
      this.onFullScreenChange,
    );
    document.removeEventListener('MSFullscreenChange', this.onFullScreenChange);
  }

  onDocumentLoaded = () => {
    this.setState({
      documentType: core.getDocument().getType(),
    });
  };

  onFullScreenChange = () => {
    const isFullScreen = !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
    this.setState({
      isFullScreen,
    });
  };

  handlePrintButtonClick = () => {
    const { dispatch, isEmbedPrintSupported } = this.props;

    print(dispatch, isEmbedPrintSupported);
  };

  handleClickOutside = e => {
    const clickedMenuButton =
      e.target.getAttribute('data-element') === 'menuButton';

    if (!clickedMenuButton) {
      this.props.closeElements(['menuOverlay']);
    }
  };

  downloadDocument = () => {
    downloadPdf(this.props.dispatch);
  };

  render() {
    const { left, right, documentType, isFullScreen } = this.state;
    const { isDisabled, t } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = getClassName('Overlay MenuOverlay', this.props);

    return (
      <div
        className={className}
        data-element="menuOverlay"
        style={{ left, right }}
        ref={this.overlay}
      >
        <ActionButton
          dataElement="filePickerButton"
          label={t('action.openFile')}
          onClick={openFilePicker}
        />
        {!isIOS && (
          <ActionButton
            dataElement="fullScreenButton"
            label={
              isFullScreen
                ? t('action.exitFullscreen')
                : t('action.enterFullscreen')
            }
            onClick={toggleFullscreen}
          />
        )}
        {documentType !== 'xod' && (
          <ActionButton
            dataElement="downloadButton"
            label={t('action.download')}
            onClick={this.downloadDocument}
          />
        )}
        <ActionButton
          dataElement="printButton"
          label={t('action.print')}
          onClick={this.handlePrintButtonClick}
          hidden={['mobile']}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isEmbedPrintSupported: selectors.isEmbedPrintSupported(state),
  isDisabled: selectors.isElementDisabled(state, 'menuOverlay'),
  isOpen: selectors.isElementOpen(state, 'menuOverlay'),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  closeElements: dataElements => dispatch(actions.closeElements(dataElements)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(onClickOutside(MenuOverlay)));
