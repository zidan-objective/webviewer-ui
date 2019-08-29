import fireEvent from 'helpers/fireEvent';

import actions from 'actions';

export default dispatch => (e, zoom) => {
  dispatch(actions.setZoom(zoom));
  fireEvent('zoomChanged', [zoom]);
};