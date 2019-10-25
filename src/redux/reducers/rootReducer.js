import { combineReducers } from 'redux';

import initialState from 'src/redux/initialState';
import viewerReducer from 'reducers/viewerReducer';
import searchReducer from 'reducers/searchReducer';
import documentReducer from 'reducers/documentReducer';

export default combineReducers({
  viewer: viewerReducer(initialState.viewer),
  search: searchReducer(initialState.search),
  document: documentReducer(initialState.document),
});