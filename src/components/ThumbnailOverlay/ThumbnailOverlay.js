import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';


import getClassName from 'helpers/getClassName';

import './ThumbnailOverlay.scss';

class ThumbnailOverlay extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.overlay = React.createRef();
    this.state = {

    };
  }

  render() {
    const { left, right } = this.state;
    const { t } = this.props;
    const className = getClassName('Overlay ThumbnailOverlay', this.props);

    return (
      <div className={className} data-element="ThumbnailOverlay" style={{ left, right }} ref={this.overlay}>
        test
      </div>
    );
  }
}



export default connect()(withTranslation()(onClickOutside(ThumbnailOverlay)));
