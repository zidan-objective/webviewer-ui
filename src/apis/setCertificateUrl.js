import actions from 'actions';

export default store => url => {
  store.dispatch(actions.setCertificateUrl(url));
};