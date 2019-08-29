import fireEvent from 'helpers/fireEvent';
import actions from 'actions';

export default dispatch => (e, pageNumber) => {
  dispatch(actions.setCurrentPage(pageNumber));
  fireEvent('pageChanged', [pageNumber]);
};