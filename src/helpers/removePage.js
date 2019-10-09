import core from 'core';
import actions from 'actions';

export default page => dispatch => {
  core.removePages([page]);
  dispatch(actions.deletePageIndex(page - 1));
};
