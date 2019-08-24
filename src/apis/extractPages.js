/**
 * Extract pages from the current document
 * @method WebViewer#extractPages
 * @param {Array<number>} pagesToExtract An array of pages numbers to extract
 * @example // 5.1 and after
WebViewer(...)
  .then(function(instance) {
    instance.extractPages([1,2,3]);
  });
 * @example // 4.0 ~ 5.0
var viewerElement = document.getElementById('viewer');
var viewer = new PDFTron.WebViewer(...);

viewerElement.addEventListener('ready', function() {
  var instance = viewer.getInstance();
  instance.extractPages([1,2,3]);
});
 */
import actions from 'actions';
import { saveAs } from 'file-saver';
import { isIE } from 'helpers/device';

export default store => pagesToExtract =>  {    
  store.dispatch(actions.openElement('progressModal'));
  const doc = window.readerControl.docViewer.getDocument();

  const pagesToExtractHash = pagesToExtract.reduce((curr, val) => {
    curr[val] = true;
    return curr;
  }, {});

  const annotManager = window.readerControl.docViewer.getAnnotationManager();
  const annotList = annotManager.getAnnotationsList().filter(annot => pagesToExtractHash[annot.PageNumber]);
  const xfdfString = annotManager.exportAnnotations({ annotList });

  const finishPromise = new Promise(function(resolve, reject) {
    try {
      doc.extractPages(pagesToExtract, xfdfString).then(data => {
        const arr = new Uint8Array(data);
        let downloadName = 'newDocument.pdf';

        let file = null;
        if (isIE) {
          file = new Blob([ arr ], { type: 'application/pdf' });
        } else {
          file = new File([ arr ], downloadName, { type: 'application/pdf' });
        }

        saveAs(file, downloadName);
        store.dispatch(actions.closeElement('progressModal')); 
        resolve();
      }).catch(function(ex) {
        reject(ex);
        store.dispatch(actions.closeElement('progressModal'));
      });
    } catch (ex) {
      reject(ex);
      store.dispatch(actions.closeElement('progressModal'));
    }
  });

  return finishPromise;
};
