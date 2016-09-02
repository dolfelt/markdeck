import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import { electronEnhancer } from 'redux-electron-store';
import rootReducer from '../reducers';

const router = routerMiddleware(hashHistory);

const enhancer = compose(
  applyMiddleware(thunk, router),
  electronEnhancer()
);

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
