import { ipcRenderer as ipc, remote } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Viewer from './viewer/containers/Viewer';
import configureStore from './store/configureStore';

// Connect to the main window
import Pipe from './viewer/Pipe';

const initialState = remote.getGlobal('state');

const store = configureStore(initialState, 'renderer');

ipc.on('redux-action', (event, payload) => {
  store.dispatch(payload);
});

new Pipe().connect();

render(
  <Provider store={store}>
    <Viewer />
  </Provider>,
  document.getElementById('root')
);
