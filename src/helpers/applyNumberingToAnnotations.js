import core from 'core';

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
    // freeText.Locked = true;
    // freeText.Listable = false;
    // freeText.ReadOnly = true;
    freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
    freeText.setContents(`${content}`);
    freeText.setCustomData('isComment', true);
    freeText.StrokeThickness = 0;
    freeText.FontSize = '16pt';

    return freeText;
  };

  let commentCount = 1;

  docViewer.on('beforeDocumentLoaded', () => {
    commentCount = 1;
  });

  eraserTool.on('erasingAnnotation', (args) => {
    // Make eraser tool skip deleting rectangle annotations
    if (args.annotation.getCustomData('isComment')) {
      args.skipAnnotation();
    }
  });

  annotManager.on('annotationChanged', (annotations, action, options) => {
    if (action === 'add' && !options.isUndoRedo) {
      annotations.forEach(annot => {
        if (annot.Listable &&
          !annot.isReply() &&
          !annot.Hidden &&
          annot.getCustomData('commentNumber') === '' &&
          annot.getCustomData('isComment') === '') {
          const freeText = createFreeTextComment(annot.PageNumber, annot.X + 50, annot.Y, commentCount);

          // bug for now b/c when exporting existing annots to xfdf, it can't serialize custom data unless we explicity trigger a change
          annot.setX(annot.getX());

          annot.setCustomData('commentNumber', `${commentCount}`);
          annot.setCustomData('freeTextId', freeText.Id);
          annotManager.groupAnnotations(annot, [freeText]);
          annotManager.addAnnotation(freeText, true);
          annotManager.redrawAnnotation(freeText);
          commentCount++;
        } else if (annot.getCustomData('commentNumber') !== '') {
          commentCount++;
        }
      });
    } else if (annotations && action === 'add' && options.isUndoRedo) {
      annotations.forEach(annot => {
        if (annot.getCustomData('freeTextId')) {
          annot.setCustomData('commentNumber', `${commentCount}`);
          const associatedFreeTextAnnot = annotManager.getAnnotationById(annot.getCustomData('freeTextId'));
          if (associatedFreeTextAnnot) {
            associatedFreeTextAnnot.setContents(`${commentCount}`);
            annotManager.groupAnnotations(annot, [associatedFreeTextAnnot]);
          } else {
            const freeText = createFreeTextComment(annot.PageNumber, annot.X + 50, annot.Y, commentCount);
            annot.setCustomData('freeTextId', freeText.Id);
            annot.setCustomData('commentNumber', `${commentCount}`);
            annotManager.groupAnnotations(annot, [freeText]);
            annotManager.addAnnotation(freeText);
          }

          commentCount++;
        } else if (annot.getCustomData('isComment')) {
          annotManager.deleteAnnotation(annot, false, true);
        }
      });
    } else if (annotations && action === 'delete' && !options.imported) {
      let commentNumberToBeDeleted;
      const doesAnnotHaveCommentNumber = annotations.some(annot => annot.getCustomData('freeTextId'));
      if (doesAnnotHaveCommentNumber) {
        annotations.forEach(annot => {
          // delete associated free text annot
          const associatedFreeTextAnnot = annotManager.getAnnotationById(annot.getCustomData('freeTextId'));
          annotManager.deleteAnnotation(associatedFreeTextAnnot, false, true);

          commentNumberToBeDeleted = +annot.getCustomData('commentNumber');
          commentCount--;
        });

        const currAnnotList = annotManager.getAnnotationsList().filter(annot => annot.getCustomData('freeTextId'));
        for (let i = commentNumberToBeDeleted; i <= commentCount; i++) {
          // correct numbering for remaing annots after deletion
          // need to do it this way as annot list is not ordered by comment number
          const annot = currAnnotList.find(element => +element.getCustomData('commentNumber') === i);
          if (annot && annot.getCustomData('freeTextId')) {
            annot.setCustomData('commentNumber', `${commentNumberToBeDeleted}`);
            const associatedFreeTextAnnot = annotManager.getAnnotationById(annot.getCustomData('freeTextId'));
            if (associatedFreeTextAnnot) {
              associatedFreeTextAnnot.setContents(`${commentNumberToBeDeleted}`);
            } else {
              const freeText = createFreeTextComment(annot.PageNumber, annot.X + 50, annot.Y, commentNumberToBeDeleted);
              annot.setCustomData('freeTextId', freeText.Id);
              annot.setCustomData('commentNumber', `${commentCount}`);
              annotManager.groupAnnotations(annot, [freeText]);
              annotManager.addAnnotation(freeText);
            }
            commentNumberToBeDeleted++;
          }
        }
      }
    }
  });
};