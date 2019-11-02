import warnDeprecatedAPI from 'helpers/warnDeprecatedAPI';
import core from 'core';

export default () => {
  warnDeprecatedAPI(
    'getCurrentPageNumber',
    'docViewer.getCurrentPage',
    '7.0',
  );

  return core.getCurrentPage();
};
