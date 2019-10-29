import getFilteredDataElements from 'helpers/getFilteredDataElements';
import { isIOS, isAndroid } from 'helpers/device';
import selectors from 'selectors';
import core from 'core';

// viewer
export const disableElement = (dataElement, priority) => (
  dispatch,
  getState,
) => {
  if (dataElement === 'leftPanel') {
    dispatch(disableElements(['leftPanel', 'leftPanelButton'], priority));
  } else if (dataElement === 'stylePopup') {
    dispatch(
      disableElements(['toolStylePopup', 'annotationStylePopup'], priority),
    );
  } else {
    const currentPriority = selectors.getDisabledElementPriority(
      getState(),
      dataElement,
    );
    if (!currentPriority || priority >= currentPriority) {
      dispatch({ type: 'DISABLE_ELEMENT', payload: { dataElement, priority } });
    }
  }
};
export const disableElements = (dataElements, priority) => (
  dispatch,
  getState,
) => {
  const filteredDataElements = getFilteredDataElements(
    getState(),
    dataElements,
    priority,
  );
  dispatch({
    type: 'DISABLE_ELEMENTS',
    payload: { dataElements: filteredDataElements, priority },
  });
};
export const enableElement = (dataElement, priority) => (
  dispatch,
  getState,
) => {
  if (dataElement === 'leftPanel') {
    dispatch(enableElements(['leftPanel', 'leftPanelButton'], priority));
  } else if (dataElement === 'stylePopup') {
    dispatch(
      enableElements(['toolStylePopup', 'annotationStylePopup'], priority),
    );
  } else {
    const currentPriority = selectors.getDisabledElementPriority(
      getState(),
      dataElement,
    );
    if (!currentPriority || priority >= currentPriority) {
      dispatch({ type: 'ENABLE_ELEMENT', payload: { dataElement, priority } });
    }
  }
};
export const enableElements = (dataElements, priority) => (
  dispatch,
  getState,
) => {
  let filteredDataElements = getFilteredDataElements(
    getState(),
    dataElements,
    priority,
  );

  if (!core.isCreateRedactionEnabled()) {
    filteredDataElements = filteredDataElements.filter(
      ele => ele !== 'redactionButton',
    );
  }

  dispatch({
    type: 'ENABLE_ELEMENTS',
    payload: { dataElements: filteredDataElements, priority },
  });
};
export const setActiveToolNameAndStyle = toolObject => (dispatch, getState) => {
  const state = getState();
  let name;

  if (isIOS || isAndroid) {
    name = toolObject.name;
  } else {
    // on desktop, auto switch between AnnotationEdit and TextSelect is true when you hover on text
    // we do this to prevent this action from spamming the console
    name =
      toolObject.name === 'TextSelect' ? 'AnnotationEdit' : toolObject.name;
  }

  if (state.viewer.activeToolName === name) {
    return;
  }
  dispatch({
    type: 'SET_ACTIVE_TOOL_NAME_AND_STYLES',
    payload: { toolName: name, toolStyles: toolObject.defaults || {} },
  });
};
export const setActiveToolStyles = (toolStyles = {}) => ({
  type: 'SET_ACTIVE_TOOL_STYLES',
  payload: { toolStyles },
});
export const setActiveToolGroup = toolGroup => ({
  type: 'SET_ACTIVE_TOOL_GROUP',
  payload: { toolGroup },
});
export const setNotePopupId = id => ({
  type: 'SET_NOTE_POPUP_ID',
  payload: { id },
});
export const triggerNoteEditing = () => ({
  type: 'SET_NOTE_EDITING',
  payload: { isNoteEditing: true },
});
export const finishNoteEditing = () => ({
  type: 'SET_NOTE_EDITING',
  payload: { isNoteEditing: false },
});
export const setFitMode = fitMode => ({
  type: 'SET_FIT_MODE',
  payload: { fitMode },
});
export const setCurrentPage = currentPage => ({
  type: 'SET_CURRENT_PAGE',
  payload: { currentPage },
});
export const setReadOnly = isReadOnly => ({
  type: 'SET_READ_ONLY',
  payload: { isReadOnly },
});
export const registerTool = tool => ({
  type: 'REGISTER_TOOL',
  payload: { ...tool },
});
export const unregisterTool = toolName => ({
  type: 'UNREGISTER_TOOL',
  payload: { toolName },
});
export const setHeaderItems = (header, headerItems) => ({
  type: 'SET_HEADER_ITEMS',
  payload: { header, headerItems },
});
export const setPopupItems = (dataElement, items) => ({
  type: 'SET_POPUP_ITEMS',
  payload: {
    dataElement,
    items,
  },
});
export const setColorPalette = (colorMapKey, colorPalette) => ({
  type: 'SET_COLOR_PALETTE',
  payload: { colorMapKey, colorPalette },
});
export const setIconColor = (colorMapKey, color) => ({
  type: 'SET_ICON_COLOR',
  payload: { colorMapKey, color },
});
export const setColorMap = colorMap => ({
  type: 'SET_COLOR_MAP',
  payload: { colorMap },
});
export const setLeftPanelWidth = width => ({
  type: 'SET_LEFT_PANEL_WIDTH',
  payload: { width },
});

// document
export const setTotalPages = totalPages => ({
  type: 'SET_TOTAL_PAGES',
  payload: { totalPages },
});
export const setOutlines = outlines => ({
  type: 'SET_OUTLINES',
  payload: { outlines },
});
export const setLayers = layers => ({
  type: 'SET_LAYERS',
  payload: { layers },
});
export const setPasswordAttempts = attempt => ({
  type: 'SET_PASSWORD_ATTEMPTS',
  payload: { attempt },
});
export const setPrintQuality = quality => ({
  type: 'SET_PRINT_QUALITY',
  payload: { quality },
});
export const setLoadingProgress = loadingProgress => ({
  type: 'SET_LOADING_PROGRESS',
  payload: { loadingProgress },
});
export const resetLoadingProgress = () => ({
  type: 'SET_LOADING_PROGRESS',
  payload: { loadingProgress: 0 },
});

// search
export const searchText = (searchValue, options) => ({
  type: 'SEARCH_TEXT',
  payload: { searchValue, options },
});
export const searchTextFull = (searchValue, options) => ({
  type: 'SEARCH_TEXT_FULL',
  payload: { searchValue, options },
});
export const addSearchListener = func => ({
  type: 'ADD_SEARCH_LISTENER',
  payload: { func },
});
export const removeSearchListener = func => ({
  type: 'REMOVE_SEARCH_LISTENER',
  payload: { func },
});
export const setSearchValue = value => ({
  type: 'SET_SEARCH_VALUE',
  payload: { value },
});
export const setActiveResult = activeResult => ({
  type: 'SET_ACTIVE_RESULT',
  payload: { activeResult },
});
export const setActiveResultIndex = index => ({
  type: 'SET_ACTIVE_RESULT_INDEX',
  payload: { index },
});
export const addResult = result => ({
  type: 'ADD_RESULT',
  payload: { result },
});
export const setCaseSensitive = isCaseSensitive => ({
  type: 'SET_CASE_SENSITIVE',
  payload: { isCaseSensitive },
});
export const setWholeWord = isWholeWord => ({
  type: 'SET_WHOLE_WORD',
  payload: { isWholeWord },
});
export const setIsSearching = isSearching => ({
  type: 'SET_IS_SEARCHING',
  payload: { isSearching },
});
export const setNoResult = noResult => ({
  type: 'SET_NO_RESULT',
  payload: { noResult },
});
export const resetSearch = () => ({ type: 'RESET_SEARCH', payload: {} });
export const setIsProgrammaticSearch = isProgrammaticSearch => ({
  type: 'SET_IS_PROG_SEARCH',
  payload: { isProgrammaticSearch },
});
export const setIsProgrammaticSearchFull = isProgrammaticSearchFull => ({
  type: 'SET_IS_PROG_SEARCH_FULL',
  payload: { isProgrammaticSearchFull },
});
