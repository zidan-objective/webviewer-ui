export default initialState => (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: payload.totalPages };
    case 'SET_OUTLINES':
      return { ...state, outlines: payload.outlines };
    case 'SET_LAYERS':
      return { ...state, layers: payload.layers };
    case 'SET_CHECKPASSWORD':
      return { ...state, checkPassword: payload.func };
    case 'SET_PASSWORD_ATTEMPTS':
      return { ...state, passwordAttempts: payload.attempt };
    case 'SET_PASSWORD':
      return { ...state, password: payload.password };
    case 'SET_PRINT_QUALITY':
      return { ...state, printQuality: payload.quality };
    case 'SET_LOADING_PROGRESS':
      return { ...state, loadingProgress: payload.loadingProgress };
    default:
      return state;
  }
};
