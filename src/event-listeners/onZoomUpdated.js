import fireEvent from 'helpers/fireEvent';

export default () => zoom => {
  fireEvent('zoomChanged', [zoom]);
};