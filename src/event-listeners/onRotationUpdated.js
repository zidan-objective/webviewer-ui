import fireEvent from 'helpers/fireEvent';

export default () => rotation => {
  fireEvent('rotationChanged', [rotation]);
};