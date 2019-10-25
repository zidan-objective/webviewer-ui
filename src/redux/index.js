import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import rootReducer from 'reducers/rootReducer';

export default () => {
  const middleware = [thunk];

  if (process.env.NODE_ENV === 'development') {
    middleware.push(createLogger({ collapsed: true }));
  }

  const store = createStore(rootReducer, applyMiddleware(...middleware));

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('reducers/rootReducer', () => {
      // eslint-disable-next-line
      const updatedReducer = require('reducers/rootReducer').default;
      store.replaceReducer(updatedReducer);
    });

    module.hot.accept();
  }

  return store;
};