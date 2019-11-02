import core from 'core';
import warnDeprecatedAPI from 'helpers/warnDeprecatedAPI';

export default () => {
  warnDeprecatedAPI(
    'goToPrevPage',
    'docViewer.setCurrentPage(Math.max(instance.docViewer.getCurrentPage() - 1, 1))',
    '7.0',
  );

  const currentPage = core.getCurrentPage();

  if (currentPage === 1) {
    console.warn('You are at the first page');
  } else {
    const prevPage = currentPage - 1;
    core.setCurrentPage(prevPage);
  }
};