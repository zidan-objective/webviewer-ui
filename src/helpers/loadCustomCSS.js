import getHashParams from 'helpers/getHashParams';

export default () => {
  const { css } = getHashParams();

  if (css) {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = css;

    document.getElementsByTagName('head')[0].appendChild(link);
  }
};