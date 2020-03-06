export default dispatch => async widget => {
  if (!window.CoreControls.isFullPDFEnabled()) {
    return;
  }

  await window.PDFNet.initialize(undefined, 'ems');

  const pdfDoc = await window.docViewer.getDocument().getPDFDoc();
  const fieldName = widget.getField().name;
  const field = await pdfDoc.getDigitalSignatureField(fieldName);
};