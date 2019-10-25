import { engineTypes } from 'constants/types';

export default pdftronServer => {
  if (pdftronServer) {
    return engineTypes.PDFTRON_SERVER;
  }
  return engineTypes.AUTO;
};
