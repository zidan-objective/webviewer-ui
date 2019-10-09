/**
 * Extract pages from the current document
 * @method WebViewer#extractPages
 * @param {Array<number>} pageindexToExtract An array of page numbers to extract
 * @example // 5.1 and after
WebViewer(...)
  .then(function(instance) {
    instance.extractPages([1,2,3]).then(function(fileData){
    });
  });
 * @example // 4.0 ~ 5.0
var viewerElement = document.getElementById('viewer');
var viewer = new PDFTron.WebViewer(...);

viewerElement.addEventListener('ready', function() {
  var instance = viewer.getInstance();
  instance.extractPages([1,2,3]).then(function(fileData){
  });
});
 */
import { isIE } from 'helpers/device';

export default () => pagesToExtract =>  {    
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
        let downloadName = 'extractedDocument.pdf';

        let file = null;
        if (isIE) {
          file = new Blob([ arr ], { type: 'application/pdf' });
        } else {
          file = new File([ arr ], downloadName, { type: 'application/pdf' });
        }

        resolve(file);
      }).catch(function(ex) {
        reject(ex);
      });
    } catch (ex) {
      reject(ex);
    }
  });

  return finishPromise;
};
