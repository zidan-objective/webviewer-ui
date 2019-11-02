import actions from 'actions';
import fireEvent from 'helpers/fireEvent';

export default dispatch => pageNumber => {
  fireEvent('pageChanged', [pageNumber]);
};