import selectors from 'selectors';

export default store => () => selectors.getSelectedThumbnailPageIndexes(store.getState()).map(pageIndex => pageIndex + 1);
