import { saveAs } from 'file-saver';

import core from 'core';
import { isIE } from 'helpers/device';
import fireEvent from 'helpers/fireEvent';
import actions from 'actions';

export default (dispatch, options) => {
  const { documentPath = 'document', filename, includeAnnotations = true, xfdfData, externalURL } = options;
  const downloadOptions = { downloadType: 'pdf' };
  let file;

  dispatch(actions.openElement('loadingModal'));

  return core.exportAnnotations().then(async xfdfString => {
    if (includeAnnotations) {
      downloadOptions.xfdfString = xfdfData || xfdfString;
    }

    const getDownloadFilename = (name, extension) => {
      if (name && name.slice(-extension.length).toLowerCase() !== extension) {
        name += extension;
      }
      return name;
    };

    const name = filename || documentPath.split('/').slice(-1)[0];
    const downloadName = getDownloadFilename(name, '.pdf');

    const doc = core.getDocument();
    let annotsToDraw = [];
    const insertPageAndAddAnnots = async doc => {
      // const annotsToDraw = [];
      // insert blank page at the end of the document
      const docViewer = window.docViewer;
      const annotManager = docViewer.getAnnotationManager();
      const Annotations = window.Annotations;
      var info = await doc.getPageInfo(0);
      var width = info.width;
      var height = info.height;
      var newPageCount = await doc.getPageCount() + 1;
      await doc.insertBlankPages([newPageCount], width, height);

      // get all annots and draw them on the last page
      const annotList = await annotManager.getAnnotationsList(); 
      let y = 10;
      let commentNumber = 1;
      let annotText = '';
      annotList.forEach(async annot => {
        if (annot.Subject != null && annot.ToolName !== 'AnnotationCreateCallout' && annot.Author != null) {
          y += 60;

          if (annot.Subject === 'Comment') {
            annotText = `${commentNumber} ${annot.Subject} created by ${annot.Author} on page number ${annot.PageNumber}: ${annot.getContents()}`;
            commentNumber++;
          } else {
            annotText = `${annot.Subject} created by ${annot.Author} on page number ${annot.PageNumber}: ${annot.getContents()}`;
          }

          const freeText = new Annotations.FreeTextAnnotation();
          freeText.PageNumber = doc.getPageCount();
          freeText.X = 50;
          freeText.Y = y;
          freeText.Width = 500;
          freeText.Height = 50;
          freeText.Listable = false;
          freeText.TextColor = new Annotations.Color(0, 0, 0);
          freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
          freeText.setContents(annotText);
          freeText.FontSize = '16pt';
          freeText.StrokeThickness = 0;
          annotsToDraw.push(freeText);
        }
      });
      annotManager.addAnnotations(annotsToDraw);
      await annotManager.drawAnnotationsFromList(annotsToDraw);
    };

    await insertPageAndAddAnnots(doc);
    const xfdf = await window.docViewer.getAnnotationManager().exportAnnotations({ annotList: annotsToDraw });
    downloadOptions.xfdfString = xfdf;

    if (externalURL) {
      const downloadIframe = document.getElementById('download-iframe') || document.createElement('iframe');
      downloadIframe.width = 0;
      downloadIframe.height = 0;
      downloadIframe.id = 'download-iframe';
      downloadIframe.src = null;
      document.body.appendChild(downloadIframe);
      downloadIframe.src = externalURL;
      dispatch(actions.closeElement('loadingModal'));
      fireEvent('finishedSavingPDF');
    } else {
      downloadOptions.flags = 'office';
      return doc.getFileData(downloadOptions).then(async data => {
        const arr = new Uint8Array(data);
        if (isIE) {
          file = new Blob([arr], { type: 'application/pdf' });
        } else {
          file = new File([arr], downloadName, { type: 'application/pdf' });
        }

        saveAs(file, downloadName);
        await doc.removePages([doc.getPageCount()]);
        dispatch(actions.closeElement('loadingModal'));
        fireEvent('finishedSavingPDF');
      }, async error => {
        await doc.removePages([doc.getPageCount()]);
        dispatch(actions.closeElement('loadingModal'));
        throw new Error(error.message);
      });
    }
  }).catch(() => {
    dispatch(actions.closeElement('loadingModal'));
  });
};
