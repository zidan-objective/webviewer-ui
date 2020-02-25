import core from 'core';

import { getSortStrategies } from 'constants/sortStrategies';
export default () => {
  const docViewer = window.docViewer;
  const annotManager = docViewer.getAnnotationManager();
  const Annotations = window.Annotations;

  const eraserTool = docViewer.getTool('AnnotationEraserTool');

  const createFreeTextComment = (pageNum, x, y, content) => {
    const freeText = new Annotations.FreeTextAnnotation();
    freeText.PageNumber = pageNum;
    freeText.X = x;
    freeText.Y = y;
    freeText.Width = 50;
    freeText.Height = 50;
    freeText.LockedContents = true;
    freeText.NoResize = true;
    freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
    freeText.setContents(`${content}`);
    freeText.setCustomData('isComment', true);
    freeText.StrokeThickness = 0;
    freeText.FontSize = '16pt';
    return freeText;
  };

  let numberingForInitialAnnotsDrawn = false;

  docViewer.on('annotationsLoaded', () => {
    const annots = annotManager.getAnnotationsList().filter(annot => annot.Listable &&
      !annot.isReply() &&
      !annot.Hidden &&
      annot.getCustomData('commentNumber') === '' &&
      annot.getCustomData('isComment') === '');

      const sortedAnnots = getSortStrategies()['position'].getSortedNotes(annots);

      sortedAnnots.forEach((annot, index) => {
        const freeText = createFreeTextComment(annot.PageNumber, annot.X + 50, annot.Y, index + 1);

          // bug for now b/c when exporting existing annots to xfdf, it can't serialize custom data unless we explicity trigger a change
          annot.setX(annot.getX());

          annot.setCustomData('commentNumber', `${index + 1}`);
          annot.setCustomData('freeTextId', freeText.Id);
          annotManager.groupAnnotations(annot, [freeText]);
          annotManager.addAnnotation(freeText, true);
          annotManager.redrawAnnotation(freeText);
      });
      numberingForInitialAnnotsDrawn = true;
  });

  eraserTool.on('erasingAnnotation', args => {
    if (args.annotation.getCustomData('isComment')) {
      args.skipAnnotation();
    }
  });

  annotManager.on('annotationChanged', (annotations, action, options) => {
    if (numberingForInitialAnnotsDrawn) {
      if (action === 'delete') {
        annotations.forEach((annot) => {
          if (annot.getCustomData('freeTextId') !== '') {
            const freeText = annotManager.getAnnotationById(annot.getCustomData('freeTextId'));
            annotManager.deleteAnnotation(freeText, false, true);
          }
        });
      }
      const annots = annotManager.getAnnotationsList().filter(annot => annot.Listable &&
        !annot.isReply() &&
        !annot.Hidden &&
        annot.getCustomData('isComment') === '');
        const sortedAnnots = getSortStrategies()['position'].getSortedNotes(annots);

        sortedAnnots.forEach((annot, index) => {
          // bug for now b/c when exporting existing annots to xfdf, it can't serialize custom data unless we explicity trigger a change
          annot.setX(annot.getX());
          annot.setCustomData('commentNumber', `${index + 1}`);
          let freeText;
          if (annot.getCustomData('freeTextId') === '') {
            freeText = createFreeTextComment(annot.PageNumber, annot.X + 50, annot.Y, index + 1);
            annot.setCustomData('freeTextId', freeText.Id);
            annotManager.groupAnnotations(annot, [freeText]);
            annotManager.addAnnotation(freeText, true);
            annotManager.redrawAnnotation(freeText);
          } else {  
            freeText = annot.getGroupedChildren()[0];
            if (freeText) {
              freeText.setContents(`${index + 1}`);
              annotManager.redrawAnnotation(freeText);
            }
          }

        });
    }
  });
};