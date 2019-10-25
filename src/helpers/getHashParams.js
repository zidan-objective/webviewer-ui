let hashParams;

export default () => {
  if (!hashParams) {
    hashParams = getWindowHash()
      .split('&')
      .reduce((hashParams, item) => {
        let [property, value] = item.split('=');
        property = decodeURIComponent(property);
        value = decodeURIComponent(value);

        if (!isUndefined(value)) {
          if (value === 'true' || value === '1') {
            value = true;
          }

          if (value === 'false' || value === '0') {
            value = false;
          }
        }

        hashParams[property] = value;
        return hashParams;
      }, {});
  }

  return hashParams;
};

// use instead of window.location.hash because of https://bugzilla.mozilla.org/show_bug.cgi?id=483304
const getWindowHash = () => {
  const url = window.location.href;
  const i = url.indexOf('#');
  return i >= 0 ? url.substring(i + 1) : '';
};

const isUndefined = val => typeof val === 'undefined';
