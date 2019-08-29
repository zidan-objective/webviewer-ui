import fireEvent from 'helpers/fireEvent';
import actions from 'actions';

export default dispatch => (e, rotation) => {
  dispatch(actions.setRotation(rotation));
  fireEvent('rotationChanged', [rotation]);
};