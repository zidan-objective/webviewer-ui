import core from 'core';

export default () => {
  const docViewer = window.docViewer;
  const annotManager = docViewer.getAnnotationManager();
  const Annotations = window.Annotations;
  let commentCount = 1;

  docViewer.on('documentLoaded', () => {
    commentCount = 1;
  });

  annotManager.on('annotationChanged', (annotations, action) => {
    if (annotations && action === 'add') {
      annotations.forEach(annot => {
        if (annot.Listable &&
          !annot.isReply() &&
          !annot.Hidden &&
          !annot.isGrouped() && !annot.isReply() && annot.getCustomData('commentNumber') === '' && annot.getCustomData('isComment') === '') {
          const freeText = new Annotations.FreeTextAnnotation();
          freeText.PageNumber = annot.PageNumber;
          freeText.X = annot.X + 50;
          freeText.Y = annot.Y;
          freeText.Width = 50;
          freeText.Height = 50;
          freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
          freeText.setContents(`${commentCount}`);
          freeText.setCustomData('isComment', true);
          freeText.StrokeThickness = 0;
          freeText.FontSize = '16pt';

          annot.setCustomData('commentNumber', `${commentCount}`);
          annot.setCustomData('freeTextId', freeText.Id);

          annotManager.addAnnotation(freeText, true);
          annotManager.redrawAnnotation(freeText);
          annotManager.groupAnnotations(annot, [freeText]);

          commentCount++;
        }
      });
    }
  });
};

// export default () => {
//   let count = 1;
//   const setNumbering = (annot) => {
//     annot.setContents(count);
//     annot.setCustomData('Numbering', count);
//     count++;
//   };
//   core.addEventListener('annotationsLoaded', () => {
//     const annotManager = window.docViewer.getAnnotationManager();
//     const annots = annotManager.getAnnotationsList();

//     if (annots) {
//       const filteredAnnots = annots.filter(annot => annot._listable && !annot.isReply());

//       if (filteredAnnots && filteredAnnots.length > 0) {
//         setNumbering(filteredAnnots[0]);
//         let replies = filteredAnnots[0].getReplies();
//         for (let i = 0; i < replies.length; i++) {
//           const reply = replies[i];
//           setNumbering(reply);
//         }
//         for (let j = 1; j < filteredAnnots.length; j++) {

//           const annot = filteredAnnots[j];
//           setNumbering(annot);

//           replies = annot.getReplies();
//           for (let k = 0; k < replies.length; k++) {
//             const reply = replies[k];
//             setNumbering(reply);
//           }
//         }

//         annotManager.drawAnnotationsFromList(filteredAnnots);
//       }


//     }
//   });
// };