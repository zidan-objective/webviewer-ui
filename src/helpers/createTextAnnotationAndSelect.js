import core from 'core';
import getToolStyles from 'helpers/getToolStyles';
import actions from 'actions';

export default (dispatch, annotationConstructor) =>  {
  let annotations = null;

  if (annotationConstructor === window.Annotations.RedactionAnnotation) {
    annotations = createRedactionAnnotation(annotationConstructor);
  } else {
    annotations = createTextAnnotation(annotationConstructor);
  }

  core.clearSelection();    
  core.addAnnotations(annotations);
  core.selectAnnotations(annotations);
  setAnnotationColor(annotations[0]);
  dispatch(actions.closeElement('textPopup'));
};


const createTextAnnotation = annotationConstructor => {
  const annotations = [];
  const quads = core.getSelectedTextQuads();
  
  Object.keys(quads).forEach(pageIndex => {
    const pageNumber = parseInt(pageIndex) + 1;
    const annotation = createAnnotation(annotationConstructor, pageNumber, quads);

    if (window.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT) {
      annotation.setContents(core.getSelectedText(pageNumber));
    }
    
    annotations.push(annotation);
  });

  return annotations;
};

const createRedactionAnnotation = annotationConstructor => {
  const annotations = [];
  const quads = core.getSelectedTextQuads();
  
  Object.keys(quads).forEach(pageIndex => {
    const pageNumber = parseInt(pageIndex) + 1;
    const annotation = createAnnotation(annotationConstructor, pageNumber, quads);

    setRedactionStyle(annotation);
    annotation.IsText = true;
    annotations.push(annotation);
  });

  return annotations;
};

const createAnnotation = (annotationConstructor, pageNumber, quads) => {
  const annotation = new annotationConstructor();

  annotation.PageNumber = pageNumber;
  annotation.Quads = quads[pageNumber - 1];
  annotation.Author = core.getCurrentUser();
  return annotation;
};

const setAnnotationColor = annotation => {
  const toolName = annotation.ToolName;  
  if (toolName) {
    const { StrokeColor } = getToolStyles(toolName);
    annotation.StrokeColor = StrokeColor;
  }
};

const setRedactionStyle = annotation => {
  const { AnnotationCreateRedaction: { defaults: style = {} } } = core.getToolModeMap();

  if (style) {
    if (style.StrokeColor) {
      const color = style.StrokeColor;
      annotation.StrokeColor = new window.Annotations.Color(color['R'], color['G'], color['B'], color['A']);
    }
    if ( style.StrokeThickness) {
      annotation.StrokeThickness = style['StrokeThickness'];
    }
    if (style.FillColor) {
      const fillColor = style.FillColor;
      annotation.FillColor = new window.Annotations.Color(fillColor['R'], fillColor['G'], fillColor['B'], fillColor['A']);
    }
    if (style.TextColor) {
      const textColor = style.TextColor;
      annotation.TextColor = new window.Annotations.Color(textColor['R'], textColor['G'], textColor['B'], textColor['A']);
    }
    
    if (style.FontSize) {
      annotation.FontSize = style['FontSize'];
    }

    if (style.TextAlign) {
      annotation.TextAlign = style['TextAlign'];
    }
    if (style['OverlayText']) {
      annotation['OverlayText'] = style['OverlayText'];
    }
  }
};
