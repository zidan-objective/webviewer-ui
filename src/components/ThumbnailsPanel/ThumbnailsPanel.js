import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import classNames from 'classnames';

import { List } from 'react-virtualized';
import Measure from 'react-measure';
import Thumbnail from 'components/Thumbnail';
import DocumentControls from 'components/DocumentControls';

import actions from 'actions';

import core from 'core';
import selectors from 'selectors';

import './ThumbnailsPanel.scss';

class ThumbnailsPanel extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    pageLabels: PropTypes.array.isRequired,
    display: PropTypes.string.isRequired,
    selectedPageIndexes: PropTypes.arrayOf(PropTypes.number),
    showWarningMessage: PropTypes.func.isRequired,
    setSelectedPageThumbnails: PropTypes.func.isRequired,
    isThumbnailMergingEnabled: PropTypes.bool,
    isThumbnailReorderingEnabled: PropTypes.bool,
    isThumbnailControlDisabled: PropTypes.bool,
    dispatch: PropTypes.func,
  }

  constructor() {
    super();
    this.pendingThumbs = [];
    this.thumbs = [];
    this.listRef = React.createRef();
    this.thumbnailHeight = 200; // refer to Thumbnail.scss
    this.afterMovePageNumber = null;
    this.state = {
      numberOfColumns: this.getNumberOfColumns(),
      draggingOverPageIndex: null,
      isDraggingOverTopHalf: false,
      selectedPageIndexes: [],
      isDocumentControlHidden: true,
      canLoad: true,
      height: 0,
      width: 0,
      draggingOverPageIndex: null,
      isDraggingOverTopHalf: false,
    };

    this.thumbnails = React.createRef();
    this.dragOverHandler = e => {
      e.preventDefault();
    };

    this.afterMovePageNumber;
  }

  componentDidMount() {
    core.addEventListener('beginRendering', this.onBeginRendering);
    core.addEventListener('finishedRendering', this.onFinishedRendering);
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
    core.addEventListener('pageNumberUpdated', this.onPageNumberUpdated);
    core.addEventListener('pageComplete', this.onPageComplete);
    core.addEventListener('annotationHidden', this.onAnnotationChanged);
    core.addEventListener('pageComplete', this.onPageComplete);
    window.addEventListener('resize', this.onWindowResize);

    if (this.thumbnails && this.thumbnails.current) {
      this.thumbnails.current.addEventListener('drop', this.onDrop);
    }
  }

  componentWillUnmount() {
    core.removeEventListener('beginRendering', this.onBeginRendering);
    core.removeEventListener('finishedRendering', this.onFinishedRendering);
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
    core.removeEventListener('pageNumberUpdated', this.onPageNumberUpdated);
    core.removeEventListener('pageComplete', this.onPageComplete);
    core.removeEventListener('annotationHidden', this.onAnnotationChanged);
    core.removeEventListener('pageComplete', this.onPageComplete);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.thumbnails && this.thumbnails.current) {
      this.thumbnails.current.removeEventListener('drop', this.onDrop);
    }
  }

  onBeginRendering = () => {
    this.setState({
      canLoad: false,
    });
  }

  onDragEnd = () => {
    const { currentPage } = this.props;
    const { draggingOverPageIndex, isDraggingOverTopHalf } = this.state;
    if (draggingOverPageIndex !== null) {
      const targetPageNumber = isDraggingOverTopHalf ? draggingOverPageIndex + 1 : draggingOverPageIndex + 2;
      let afterMovePageNumber = null;

      if (currentPage < targetPageNumber) {
        // moving page down so target page number will decrease
        afterMovePageNumber = targetPageNumber - 1;
      } else {
        // moving page up
        afterMovePageNumber = targetPageNumber;
      }

      this.afterMovePageNumber = afterMovePageNumber;
      core.movePages([currentPage], targetPageNumber);
    }

    this.setState({ draggingOverPageIndex: null });
  }

  onPageComplete = () => {
    if (this.afterMovePageNumber) {
      core.setCurrentPage(this.afterMovePageNumber);
      this.afterMovePageNumber = null;
    }
  }

  onDragOver = (e, index) => {
    // 'preventDefault' to prevent opening pdf dropped in and 'stopPropagation' to keep parent from opening pdf
    e.preventDefault();
    e.stopPropagation();

    const { isThumbnailReorderingEnabled, isThumbnailMergingEnabled } = this.props;

    if (!isThumbnailReorderingEnabled && !isThumbnailMergingEnabled) {
      return;
    }

    const thumbnail = e.target.getBoundingClientRect();

    this.setState({
      draggingOverPageIndex: index,
      isDraggingOverTopHalf: !(e.pageY > (thumbnail.y + thumbnail.height / 2)),
    });
  }

  onDragStart = (e, index) => {
    const { currentPage } = this.props;

    // need to set 'text' to empty for drag to work in FireFox and mobile
    e.dataTransfer.setData('text', '');

    if (currentPage !== (index + 1)) {
      core.setCurrentPage(index + 1);
    }
  }

  onDrop = e => {
    e.preventDefault();
    const { isThumbnailMergingEnabled, dispatch } = this.props;
    const { draggingOverPageIndex, isDraggingOverTopHalf } = this.state;
    const { files } = e.dataTransfer;

    if (isThumbnailMergingEnabled && files.length) {
      const file = files[0];
      const insertTo = isDraggingOverTopHalf ? draggingOverPageIndex + 1 : draggingOverPageIndex + 2;

      dispatch(actions.openElement('loadingModal'));

      core.mergeDocument(file, insertTo).then(() => {
        dispatch(actions.closeElement('loadingModal'));
        core.setCurrentPage(insertTo);
      }).catch(() => {
        dispatch(actions.closeElement('loadingModal'));
      });

      this.setState({ draggingOverPageIndex: null });
    }
  }

  onFinishedRendering = needsMoreRendering => {
    if (!needsMoreRendering) {
      this.setState({
        canLoad: true,
      });
    }
  }

  onAnnotationChanged = annots => {
    const indices = [];

    annots.forEach(annot => {
      const pageIndex = annot.PageNumber - 1;
      if (!annot.Listable || indices.indexOf(pageIndex) > -1) {
        return;
      }
      indices.push(pageIndex);

      this.updateAnnotations(pageIndex);
    });
  }

  onPageNumberUpdated = pageNumber => {
    this.listRef.current?.scrollToRow(pageNumber - 1);
  }

  onWindowResize = () => {
    this.setState({
      numberOfColumns: this.getNumberOfColumns(),
    });
  }

  getNumberOfColumns = () => {
    const thumbnailContainerSize = 180;
    const desktopBreakPoint = 640;
    const { innerWidth } = window;
    let numberOfColumns;

    if (innerWidth >= desktopBreakPoint) {
      numberOfColumns = 1;
    } else if (innerWidth >= 3 * thumbnailContainerSize) {
      numberOfColumns = 3;
    } else if (innerWidth >= 2 * thumbnailContainerSize) {
      numberOfColumns = 2;
    } else {
      numberOfColumns = 1;
    }

    return numberOfColumns;
  }

  updateAnnotations = pageIndex => {
    const thumbContainer = this.thumbs[pageIndex] && this.thumbs[pageIndex].element;
    if (!thumbContainer) {
      return;
    }

    const pageWidth = core.getPageWidth(pageIndex);
    const pageHeight = core.getPageHeight(pageIndex);
    const pageNumber = pageIndex + 1;

    const { width, height } = this.getThumbnailSize(pageWidth, pageHeight);

    const annotCanvas = thumbContainer.querySelector('.annotation-image') || document.createElement('canvas');
    annotCanvas.className = 'annotation-image';
    const ctx = annotCanvas.getContext('2d');

    let zoom = 1;
    let rotation = core.getCompleteRotation(pageNumber) - core.getRotation(pageNumber);
    if (rotation < 0) {
      rotation += 4;
    }
    const multiplier = window.utils.getCanvasMultiplier();

    if (rotation % 2 === 0) {
      annotCanvas.width = width;
      annotCanvas.height = height;
      zoom = annotCanvas.width / pageWidth;
      zoom /= multiplier;
    } else {
      annotCanvas.width = height;
      annotCanvas.height = width;

      zoom = annotCanvas.height / pageWidth;
      zoom /= multiplier;
    }

    thumbContainer.appendChild(annotCanvas);
    core.setAnnotationCanvasTransform(ctx, zoom, rotation);

    let options = {
      pageNumber,
      overrideCanvas: annotCanvas,
      namespace: 'thumbnails',
    };

    var thumb = thumbContainer.querySelector('.page-image');

    if (thumb) {
      options = {
        ...options,
        overridePageRotation: rotation,
        overridePageCanvas: thumb,
      };
    } else {
      return;
    }

    core.drawAnnotations(options);
  }

  getThumbnailSize = (pageWidth, pageHeight) => {
    let width; let height; let
      ratio;

    if (pageWidth > pageHeight) {
      ratio = pageWidth / 150;
      width = 150;
      height = Math.round(pageHeight / ratio);
    } else {
      ratio = pageHeight / 150;
      width = Math.round(pageWidth / ratio); // Chrome has trouble displaying borders of non integer width canvases.
      height = 150;
    }

    return {
      width,
      height,
    };
  }

  onLoad = (pageIndex, element) => {
    if (!this.thumbIsLoaded(pageIndex) && !this.thumbIsPending(pageIndex)) {
      this.thumbs[pageIndex] = {
        element,
        loaded: false,
      };

      const id = core.loadThumbnailAsync(pageIndex, thumb => {
        thumb.className = 'page-image';
        if (this.thumbs[pageIndex]) {
          this.thumbs[pageIndex].element.appendChild(thumb);
          this.thumbs[pageIndex].loaded = true;
          this.thumbs[pageIndex].updateAnnotationHandler = this.updateAnnotations.bind(this);
          this.removeFromPendingThumbs(pageIndex);
          this.updateAnnotations(pageIndex);
        }
      });

      this.pendingThumbs.push({
        pageIndex,
        id,
      });
    }
  }

  removeFromPendingThumbs = pageIndex => {
    const index = this.getPendingThumbIndex(pageIndex);
    if (index !== -1) {
      this.pendingThumbs.splice(index, 1);
    }
  }

  thumbIsLoaded = pageIndex => this.thumbs[pageIndex]?.loaded

  thumbIsPending = pageIndex => this.getPendingThumbIndex(pageIndex) !== -1

  onCancel = pageIndex => {
    const index = this.getPendingThumbIndex(pageIndex);
    if (index !== -1) {
      core.cancelLoadThumbnail(this.pendingThumbs[index].id);
      this.pendingThumbs.splice(index, 1);
    }
  }

  getPendingThumbIndex = pageIndex => this.pendingThumbs.findIndex(thumbStatus => thumbStatus.pageIndex === pageIndex)

  onRemove = pageIndex => {
    this.onCancel(pageIndex);
    this.thumbs[pageIndex] = null;
  }

  onDragEnd = () => {
    const { currentPage, selectedPageIndexes, setSelectedPageThumbnails } = this.props;
    const { draggingOverPageIndex, isDraggingOverTopHalf } = this.state;
    if (draggingOverPageIndex !== null) {
      const targetPageNumber = isDraggingOverTopHalf ? draggingOverPageIndex + 1 : draggingOverPageIndex + 2;

      if (currentPage < targetPageNumber) {
        // moving page down so target page number will decrease
        this.afterMovePageNumber = targetPageNumber - 1;
      } else {
        // moving page up
        this.afterMovePageNumber = targetPageNumber;
      }

      core.movePages([currentPage], targetPageNumber).then(() => {
        const currentPageIndex = currentPage - 1;
        const targetPageIndex = this.afterMovePageNumber - 1;

        const isSelected = selectedPageIndexes.includes(currentPageIndex);
        let updateSelectedPageIndexes = selectedPageIndexes;

        if (isSelected) {
          updateSelectedPageIndexes = selectedPageIndexes.filter(pageIndex => pageIndex !== currentPageIndex);
        }

        if (currentPageIndex > targetPageIndex) {
          updateSelectedPageIndexes = updateSelectedPageIndexes.map(p => (p < currentPageIndex && p >= targetPageIndex ? p + 1 : p));
        } else {
          updateSelectedPageIndexes = updateSelectedPageIndexes.map(p => (p > currentPageIndex && p <= targetPageIndex ? p - 1 : p));
        }

        if (isSelected) {
          updateSelectedPageIndexes.push(targetPageIndex);
        }

        setSelectedPageThumbnails(updateSelectedPageIndexes);
      });
    }

    this.setState({ draggingOverPageIndex: null });
  }

  onPageComplete = () => {
    if (this.afterMovePageNumber) {
      core.setCurrentPage(this.afterMovePageNumber);
    }

    this.afterMovePageNumber = null;
  }

  onDragOver = (e, index) => {
    // prevent opening pdf dropped in
    e.preventDefault();
    const thumbnail = e.target.getBoundingClientRect();

    if (e.pageY > (thumbnail.y + thumbnail.height / 2)) {
      this.setState({ draggingOverPageIndex: index, isDraggingOverTopHalf: false });
    } else {
      this.setState({ draggingOverPageIndex: index, isDraggingOverTopHalf: true });
    }
  }

  onDragStart = (e, index) => {
    const { currentPage } = this.props;

    // need to set 'text' to empty for drag to work in FireFox and mobile
    e.dataTransfer.setData('text', '');

    if (currentPage !== (index + 1)) {
      core.setCurrentPage(index + 1);
    }
  }

  onThumbnailClick = (e, index) => {
    const { selectedPageIndexes, setSelectedPageThumbnails } = this.props;
    let updatedSelectedPages = [...selectedPageIndexes];

    if (selectedPageIndexes.indexOf(index) > -1) {
      updatedSelectedPages = selectedPageIndexes.filter(pageIndex => index !== pageIndex);
    } else {
      updatedSelectedPages.push(index);
    }

    setSelectedPageThumbnails(updatedSelectedPages);

    this.setState({
      isDocumentControlHidden: updatedSelectedPages.length === 0,
    });

    core.setCurrentPage(index + 1);
  }

  updateSelectedPage = selectedPageIndexes => {
    this.props.setSelectedPageThumbnails(selectedPageIndexes);
    this.setState({ selectedPageIndexes });
  }

  onDeletePages = () => {
    const { showWarningMessage, selectedPageIndexes, setSelectedPageThumbnails } = this.props;

    const warning = {
      message: i18next.t('option.thumbnailPanel.deleteWarningMessage'),
      title: i18next.t('option.thumbnailPanel.deleteWarningTitle'),
      confirmBtnText: i18next.t('option.thumbnailPanel.deleteWarningConfirmText'),
      onConfirm: () => core.removePages(selectedPageIndexes.map(pageIndex => pageIndex + 1)).then(() => {
        setSelectedPageThumbnails([]);
      }),
      keepOpen: ['leftPanel'],
    };

    if (selectedPageIndexes.length === 0) {
      warning.onConfirm = () => Promise.resolve();
      warning.message = i18next.t('option.thumbnailPanel.deleteZeroPageError');
    }

    showWarningMessage(warning);
  }

  onDrop = e => {
    e.preventDefault();
    const { draggingOverPageIndex, isDraggingOverTopHalf } = this.state;
    const { files } = e.dataTransfer;

    if (files.length) {
      const file = files[0];
      const insertTo = isDraggingOverTopHalf ? draggingOverPageIndex + 1 : draggingOverPageIndex + 2;

      window.readerControl.mergeDocument(file, insertTo).then(() => {
        core.setCurrentPage(insertTo);
      });

      this.setState({ draggingOverPageIndex: null });
    }
  }

  renderThumbnails = ({ index, key, style }) => {
    const {
      numberOfColumns,
      canLoad,
      draggingOverPageIndex,
      isDraggingOverTopHalf,
    } = this.state;
    const { currentPage, selectedPageIndexes, isThumbnailReorderingEnabled, isThumbnailMergingEnabled } = this.props;
    const { thumbs } = this;

    const className = classNames({
      columnsOfThumbnails: (numberOfColumns > 1),
      row: true,
    });

    const selectedPagesHash = selectedPageIndexes.reduce((curr, val) => {
      curr[val] = true;
      return curr;
    }, {});

    return (
      <div className={className} key={key} style={style}>
        {
          new Array(numberOfColumns).fill().map((_, columnIndex) => {
            const thumbIndex = index * numberOfColumns + columnIndex;
            const updateHandler = thumbs && thumbs[thumbIndex] ? thumbs[thumbIndex].updateAnnotationHandler : null;
            const showPlaceHolder = (isThumbnailMergingEnabled || isThumbnailReorderingEnabled) && draggingOverPageIndex === thumbIndex;

            return (
              thumbIndex < this.props.totalPages
                ? <div key={thumbIndex} onDragEnd={this.onDragEnd}>
                  {showPlaceHolder && isDraggingOverTopHalf && <hr className="thumbnailPlaceholder" />}
                  <Thumbnail
                    isDraggable={isThumbnailReorderingEnabled}
                    index={thumbIndex}
                    currentPage={currentPage}
                    isSelected={selectedPagesHash[index]}
                    canLoad={canLoad}
                    onLoad={this.onLoad}
                    onCancel={this.onCancel}
                    onRemove={this.onRemove}
                    onClickCallback={this.onThumbnailClick}
                    updateAnnotations={updateHandler}
                    onDragStart={this.onDragStart}
                    onDragOver={this.onDragOver}
                  />
                  {showPlaceHolder && !isDraggingOverTopHalf && <hr className="thumbnailPlaceholder" />}
                </div>
                : null
            );
          })
        }
      </div>
    );
  }

  toggleDocumentControl = shouldShowControls => {
    this.props.setSelectedPageThumbnails([]);
    this.setState({
      isDocumentControlHidden: !shouldShowControls,
    });
  }

  render() {
    const { isDisabled, totalPages, display, pageLabels, selectedPageIndexes, isThumbnailControlDisabled } = this.props;
    const { isDocumentControlHidden, numberOfColumns, height, width } = this.state;

    const thumbnailHeight = isThumbnailControlDisabled ? 180 : 208; // refer to Thumbnail.scss

    if (isDisabled) {
      return null;
    }

    const shouldShowControls = !isDocumentControlHidden || selectedPageIndexes.length > 0;
    return (
      <div
        className="Panel ThumbnailsPanel"
        style={{ display }}
        data-element="thumbnailsPanel"
        ref={this.thumbnails}
        onDragOver={this.dragOverHandler}
      >
        <Measure
          bounds
          onResize={({ bounds }) => {
            this.setState({
              height: bounds.height,
              width: bounds.width,
            });
          }}
        >
          {({ measureRef }) => (
            <div ref={measureRef} className="virtualized-thumbnails-container" >
              <List
                ref={this.listRef}
                height={!shouldShowControls ? height : height - 50}
                width={width}
                rowHeight={thumbnailHeight}
                // Round it to a whole number because React-Virtualized list library doesn't round it for us and throws errors when rendering non whole number rows
                // use ceiling rather than floor so that an extra row can be created in case the items can't be evenly distributed between rows
                rowCount={Math.ceil(totalPages / numberOfColumns)}
                rowRenderer={this.renderThumbnails}
                overscanRowCount={10}
                className={'thumbnailsList '}
                style={{ outline: 'none',
                  paddingBottom: !shouldShowControls ? '0px' : '50px',
                }}
              />

              <DocumentControls
                toggleDocumentControl={this.toggleDocumentControl}
                shouldShowControls={shouldShowControls}
                pageLabels={pageLabels}
                selectedPageIndexes={selectedPageIndexes}
                selectedPageCount={selectedPageIndexes.length}
                deletePagesCallBack={this.onDeletePages}
                updateSelectedPage={this.updateSelectedPage}
              />
            </div>
          )}
        </Measure>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'thumbnailsPanel'),
  totalPages: selectors.getTotalPages(state),
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
  selectedPageIndexes: selectors.getSelectedThumbnailPageIndexes(state),
  isThumbnailMergingEnabled: selectors.getIsThumbnailMergingEnabled(state),
  isThumbnailReorderingEnabled: selectors.getIsThumbnailReorderingEnabled(state),
  isThumbnailControlDisabled: selectors.isElementDisabled(state, 'thumbnailControl'),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  setSelectedPageThumbnails: pages => dispatch(actions.setSelectedPageThumbnails(pages)),
  showWarningMessage: warning => dispatch(actions.showWarningMessage(warning)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ThumbnailsPanel);
