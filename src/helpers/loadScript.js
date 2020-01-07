import getHashParams from 'helpers/getHashParams';

const loadScript = (scriptSrc, warning) =>
  new Promise(resolve => {
    if (!scriptSrc) {
      return resolve();
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function() {
      resolve();
    };
    script.onerror = function() {
      if (warning) {
        console.warn(warning);
      }
      resolve();
    };
    script.src = scriptSrc;
    document.getElementsByTagName('head')[0].appendChild(script);
  });

// communicates with the parent window to get the URL of the config file and loads it
// ignore subsequent messages after successfully loads a config file
const loadConfig = () =>
  new Promise(resolve => {
    if (window.parent === window) {
      // resolve immediately if we are developing the UI on its own
      resolve();
    } else {
      window.addEventListener('message', async function loadConfig(e) {
        if (e.data.type === 'responseConfig') {
          const { value } = e.data;

          try {
            if (value) {
              const response = await fetch('configorigin.txt');

              let data = null;
              if (response.status === 200) {
                data = await response.text();
              }

              if (data === null || data.split('\n').includes(e.origin)) {
                await loadScript(e.data.value, 'Config script could not be loaded');
                window.removeEventListener('message', loadConfig);
              }
            }
          } finally {
            resolve();
          }
        }
      });

      window.parent.postMessage({
        type: 'requestConfig',
        id: parseInt(getHashParams('id'), 10),
      }, '*');
    }
  });

export default loadScript;
export { loadConfig };
