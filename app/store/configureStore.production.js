import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from './reducers';

// Middleware
import forwardToMain from './middleware/forwardToMain';
import forwardToRenderer from './middleware/forwardToRenderer';

const router = routerMiddleware(hashHistory);

let middleware = [
  thunk,
];

const enhancer = (ware) => compose(
  applyMiddleware(...ware)
);

export default function configureStore(initialState, scope = 'renderer') {
  if (scope === 'renderer') {
    middleware = [
      forwardToMain,
      router,
      ...middleware,
    ];
  }
  if (scope === 'main') {
    middleware = [
      ...middleware,
      forwardToRenderer,
    ];
  }

  return createStore(rootReducer, initialState, enhancer(middleware));
}
