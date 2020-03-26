import actions from 'actions';

export default dispatch => () => {
  dispatch(actions.closeElements(['pageNavOverlay', 'searchOverlay', 'signatureValidationModal']));
  dispatch(actions.setOutlines([]));
  dispatch(actions.setTotalPages(0));
};