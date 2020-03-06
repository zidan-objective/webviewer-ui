/**
 * Returns a string with the key shortcut, or undefined.
 * @param {string} tool The tool to get the aria keyshortcut for.
 */
export function getAriaKeyshortcuts(tool) {
  switch (tool) {
    case "arrow":
      return "A";
    case "callout":
      return "C";
    case "copy":
      return "Control+C";
    case "delete":
      return "Backspace";
    case "ellipse":
      return "O";
    case "eraser":
      return "E";
    case "freehand":
      return "F";
    case "freetext":
      return "T";
    case "highlight":
      return "H";
    case "line":
      return "L";
    case "pan":
      return "P";
    case "rectangle":
      return "R";
    case "rotateClockwise":
      return "Control+Shift++";
    case "rotateCounterClockwise":
      return "Control+Shift+-";
    case "select":
      return "Esc";
    case "signature":
      return "S";
    case "squiggly":
      return "G";
    case "stamp":
      return "I";
    case "stickyNote":
      return "N";
    case "strikeout":
      return "K";
    case "underline":
      return "U";
    case "zoomIn":
      return "Control++";
    case "zoomOut":
      return "Control+-";
    default:
      return undefined;
  }
}
