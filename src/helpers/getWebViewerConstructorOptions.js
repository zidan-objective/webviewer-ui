let options;

/**
 * options used to initialize WebViewer will be passed to the UI as part of the URL
 * this function parses the URL and returns an object that matches the WebViewer constructor options
 * @ignore
 */
export default () => {
  if (options) {
    return options;
  }

  options = getWindowHash()
    .split('&')
    .reduce((options, item) => {
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

      options[property] = value;
      return options;
    }, {});

  // webviewer.min.js will change the name of some constructor options
  // not sure if it's a good idea but here we change the names back for the purpose of better variable naming and fewer potential confusions
  options.initialDoc = options.d;
  options.externalPath = options.p;
  options.enableAnnotations = options.a;
  options.serverUrl = options.server_url;
  options.documentId = options.did;
  options.enableOfflineMode = options.offline;
  options.enableReadOnlyMode = options.readonly;
  options.annotationUser = options.user;
  options.annotationAdmin = options.admin;
  options.enableFilePicker = options.filepicker;
  options.fullAPI = options.pdfnet;
  options.showToolbarControl = options.toolbar;

  return options;
};

// use instead of window.location.hash because of https://bugzilla.mozilla.org/show_bug.cgi?id=483304
const getWindowHash = () => {
  const url = window.location.href;
  const i = url.indexOf('#');
  return i >= 0 ? url.substring(i + 1) : '';
};

const isUndefined = val => typeof val === 'undefined';
