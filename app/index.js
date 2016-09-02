import { ipcRenderer, remote } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import configureStore from './store/configureStore';
import './styles/app.css';

const initialState = remote.getGlobal('state');

const store = configureStore(initialState, 'renderer');
const history = syncHistoryWithStore(hashHistory, store);

ipcRenderer.on('redux-action', (event, payload) => {
  store.dispatch(payload);
  if (global.webview) {
    global.webview.send('redux-action', payload);
  }
});

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
);
