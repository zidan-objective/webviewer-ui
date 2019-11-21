/**
 * Merge a file into the currently opened document
 * @method WebViewer#mergeDocument
 * @param {(string|File)} documentPath Path to the document OR <a href='https://developer.mozilla.org/en-US/docs/Web/API/File' target='_blank'>File object</a> if opening local file.
 * @param {number} position Position to put the merged document, default to end of file if nothing entered
 * @example // 5.1 and after
WebViewer(...)
  .then(function(instance) {
    instance.mergeDocument('https://www.pdftron.com/downloads/pl/test.pdf', 1);
  });
 */
export default () => (documentToMerge, position) => {
  return window.readerControl.docViewer.getDocument().mergeDocument(documentToMerge, position);
};