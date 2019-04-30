import actions from 'actions';

export default store => popupItems => {
  store.dispatch(actions.setAnnotationPopupItems(popupItems));
};