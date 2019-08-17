import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Button from 'components/Button';
import Tooltip from 'components/Tooltip';

import core from 'core';

import './ThumbnailsControls.scss';

class ThumbnailsControls extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number.isRequired,
  }

  constructor() {
    super();
    this.rotateCounterClockwiseHander = this.rotateCounterClockwise.bind(this);
    this.rotateClockwiseHander  = this.rotateClockwise.bind(this);
    this.deletePageHander  = this.deletePage.bind(this);
  }

  rotateClockwise() {
    const { index } = this.props;
    core.rotatePages([index + 1], window.CoreControls.PageRotation.e_90);
  }

  rotateCounterClockwise() {
    const { index } = this.props;
    core.rotatePages([index + 1], window.CoreControls.PageRotation.e_270);
  }

  deletePage() {
    const { index } = this.props;
    core.removePages([index + 1]);
  }

  render() {
    return (
      <div className="thumbnailsControls" data-element="thumbnailsControls">
        <Tooltip content="action.rotateCounterClockwise">
          <Button
            img="ic_rotate_left_black_24px"
            onClick={this.rotateCounterClockwiseHander}
          />
        </Tooltip>
        <Tooltip content="action.delete">
          <Button
            img="ic_delete_black_24px"
            onClick={this.deletePageHander}
          />
        </Tooltip>
        <Tooltip content="action.rotateClockwise">
          <Button
            img="ic_rotate_right_black_24px"
            onClick={this.rotateClockwiseHander}
          />
        </Tooltip>
      </div>
    );
  }
}

export default withTranslation()(ThumbnailsControls);