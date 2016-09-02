import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { hashHistory } from 'react-router';
import { routerMiddleware, push } from 'react-router-redux';
import rootReducer from './reducers';

// Middleware
import forwardToMain from './middleware/forwardToMain';
import forwardToRenderer from './middleware/forwardToRenderer';

import * as editorActions from '../editor/actions';

const actionCreators = {
  ...editorActions,
  push,
};

const logger = createLogger({
  level: 'info',
  collapsed: true,
});

const router = routerMiddleware(hashHistory);

let middleware = [
  thunk,
  logger,
];

const enhancer = (ware) => compose(
  applyMiddleware(...ware),
  (typeof window === 'object' && typeof window.devToolsExtension !== 'undefined') ?
    window.devToolsExtension() :
    f => f
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

  const store = createStore(rootReducer, initialState, enhancer(middleware));

  if (typeof window === 'object' && typeof window.devToolsExtension !== 'undefined') {
    window.devToolsExtension.updateStore(store);
  }

  if (module.hot) {
    module.hot.accept('./reducers', () =>
      store.replaceReducer(require('./reducers')) // eslint-disable-line global-require
    );
  }

  return store;
}
