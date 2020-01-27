import core from 'core';

export default () => {
  const docViewer = window.docViewer;
  const annotManager = docViewer.getAnnotationManager();
  const Annotations = window.Annotations;
  let commentCount = 1;

  docViewer.on('beforeDocumentLoaded', () => {
    commentCount = 1;
  });

  annotManager.on('annotationChanged', (annotations, action, options) => {
    if (annotations && action === 'add') {
      annotations.forEach(annot => {
        if (annot.Listable &&
          !annot.isReply() &&
          !annot.Hidden &&
          annot.getCustomData('commentNumber') === '' &&
          annot.getCustomData('isComment') === '') {
          const freeText = new Annotations.FreeTextAnnotation();
          freeText.PageNumber = annot.PageNumber;
          freeText.X = annot.X + 50;
          freeText.Y = annot.Y;
          freeText.Width = 50;
          freeText.Height = 50;
          freeText.Listable = false;
          freeText.ReadOnly = true;
          freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
          freeText.setContents(`${commentCount}`);
          freeText.setCustomData('isComment', true);
          freeText.StrokeThickness = 0;
          freeText.FontSize = '16pt';

          // bug for now b/c when exporting existing annots to xfdf, it can't serialize custom data unless we explicity trigger a change
          annot.setX(annot.getX());

          annot.setCustomData('commentNumber', `${commentCount}`);
          annot.setCustomData('freeTextId', freeText.Id);

          annotManager.addAnnotation(freeText, true);
          annotManager.redrawAnnotation(freeText);
          annotManager.groupAnnotations(annot, [freeText]);

          commentCount++;
        } else if (annot.getCustomData('commentNumber') !== '') {
          commentCount++;
        }
      });
    }
    else if (annotations && action === 'delete' && !options.imported) {
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
        for (let i = commentNumberToBeDeleted + 1; i <= commentCount; i++) {
          // correct numbering for remaing annots after deletion
          // need to do it this way as annot list is not ordered by comment number
          const annot = currAnnotList.find(element => +element.getCustomData('commentNumber') === i);
          if (annot && annot.getCustomData('freeTextId')) {
            annot.setCustomData('commentNumber', `${commentNumberToBeDeleted}`);
            const associatedFreeTextAnnot = annotManager.getAnnotationById(annot.getCustomData('freeTextId'));
            associatedFreeTextAnnot.setContents(`${commentNumberToBeDeleted}`);
            commentNumberToBeDeleted++;
          }
        }
      }
    }
  });
};