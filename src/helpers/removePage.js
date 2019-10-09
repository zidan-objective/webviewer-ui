import core from 'core';
import actions from 'actions';

export default page => dispatch => {
  return core.removePages([page]).then(() => {
    dispatch(actions.deletePageIndex(page - 1));
  });
};
