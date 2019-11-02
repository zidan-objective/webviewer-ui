import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import { isMobile } from 'helpers/device';
import actions from 'actions';
import selectors from 'selectors';

import './Thumbnail.scss';

class Thumbnail extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number.isRequired,
    pageLabels: PropTypes.array.isRequired,
    canLoad: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    updateAnnotations: PropTypes.func,
    closeElement: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
    this.thumbContainer = React.createRef();
  }

  componentDidMount() {
    const { onLoad, index } = this.props;

    onLoad(index, this.thumbContainer.current);
    core.addEventListener('layoutChanged', this.onLayoutChangedHandler);
    core.addEventListener('pageNumberUpdated', this.onPageNumberUpdated);
  }

  componentDidUpdate(prevProps) {
    const { onLoad, onCancel, index } = this.props;

    if (!prevProps.canLoad && this.props.canLoad) {
      onLoad(index, this.thumbContainer.current);
    }
    if (prevProps.canLoad && !this.props.canLoad) {
      onCancel(index);
    }
  }

  componentWillUnmount() {
    const { onRemove, index } = this.props;
    core.removeEventListener('layoutChanged', this.onLayoutChangedHandler);
    core.removeEventListener('pageNumberUpdated', this.onPageNumberUpdated);
    onRemove(index);
  }

  onLayoutChanged = changes => {
    const { contentChanged, moved, added, removed } = changes;
    const { index } = this.props;

    const currentPage = index + 1;
    const currentPageStr = `${currentPage}`;

    const isPageAdded = added.indexOf(currentPage) > -1;
    const didPageChange = contentChanged.some(changedPage => currentPageStr === changedPage);
    const didPageMove = Object.keys(moved).some(movedPage => currentPageStr === movedPage);
    const isPageRemoved = removed.indexOf(currentPage) > -1;

    if (isPageAdded || didPageChange || didPageMove || isPageRemoved) {
      const { thumbContainer } = this;
      const { current } = thumbContainer;

      core.loadThumbnailAsync(index, thumb => {
        thumb.className = 'page-image';
        current.removeChild(current.querySelector('.page-image'));
        current.appendChild(thumb);
        if (this.props.updateAnnotations) {
          this.props.updateAnnotations(index);
        }
      });
    }
  }

  onPageNumberUpdated = pageNumber => {
    this.setState({
      currentPage: pageNumber,
    });
  }

  handleClick = () => {
    const { index, closeElement } = this.props;

    core.setCurrentPage(index + 1);

    if (isMobile()) {
      closeElement('leftPanel');
    }
  }

  render() {
    const { index, pageLabels } = this.props;
    const isActive = this.state.currentPage === index + 1;
    const pageLabel = pageLabels[index];

    return (
      <div className={`Thumbnail ${isActive ? 'active' : ''}`}>
        <div className="container" ref={this.thumbContainer} onClick={this.handleClick}></div>
        <div className="page-label">{pageLabel}</div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  pageLabels: selectors.getPageLabels(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail);
