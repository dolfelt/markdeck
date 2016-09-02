import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import editor from '../editor/reducer';

const rootReducer = combineReducers({
  editor,
  routing
});

export default rootReducer;
