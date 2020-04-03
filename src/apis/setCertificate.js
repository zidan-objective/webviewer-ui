import actions from 'actions';

export default store => certificate => {
  store.dispatch(actions.setCertificate(certificate));
};