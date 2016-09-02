import { ipcRenderer, remote } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Viewer from './viewer/containers/Viewer';
import configureStore from './store/configureStore';

const initialState = remote.getGlobal('state');

const store = configureStore(initialState, 'renderer');

ipcRenderer.on('redux-action', (event, payload) => {
  store.dispatch(payload);
});

render(
  <Provider store={store}>
    <Viewer />
  </Provider>,
  document.getElementById('root')
);
