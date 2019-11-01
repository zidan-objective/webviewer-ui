let params;

/**
 * parses the URL and put all the key value pairs into a cached object
 * the hash parameters represent what options are passed to the WebViewer constructor and are used as an initial setup for the UI
 * for example:
 * WebViewer({
 *   initialDoc: 'abc.pdf',
 *   fullAPI: true,
 *   enableMeasurement: true,
 * });
 * will result in the URL having these hash params: #d=abc.pdf&pdfnet=1&enableMeasurement=1
 * @ignore
 */
export default () => {
  if (params) {
    return params;
  }

  params = getWindowHash()
    .split('&')
    .reduce((params, item) => {
      // eslint-disable-next-line
      let [property, value] = item.split('=').map(decodeURIComponent);

      if (!isUndefined(value)) {
        if (value === 'true' || value === '1') {
          value = true;
        }
        if (value === 'false' || value === '0') {
          value = false;
        }
      }

      params[property] = value;
      return params;
    }, {});

  return params;
};

// use instead of window.location.hash because of https://bugzilla.mozilla.org/show_bug.cgi?id=483304
const getWindowHash = () => {
  const url = window.location.href;
  const i = url.indexOf('#');
  return i >= 0 ? url.substring(i + 1) : '';
};

const isUndefined = val => typeof val === 'undefined';
