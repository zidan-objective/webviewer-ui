import $ from 'jquery';

import actions from 'actions';

export default dispatch => (e, rotation) => {
  dispatch(actions.setRotation(rotation));
  $(document).trigger('rotationChanged', [rotation]);
};