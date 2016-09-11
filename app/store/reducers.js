import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import main from '../main/reducer';
import editor from '../editor/reducer';

const rootReducer = combineReducers({
  main,
  editor,
  routing
});

export default rootReducer;
