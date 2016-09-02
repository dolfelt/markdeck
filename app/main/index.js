import { app, ipcMain } from 'electron';
import createWindow from './createWindow';
import configureStore from '../store/configureStore';

// we have to do this to ease remote-loading of the initial state :(
global.state = {};
global.renderers = {};

const store = configureStore(global.state, 'main');

store.subscribe(async () => {
  global.state = store.getState();
    // persist store changes
    // TODO: should this be blocking / wait? _.throttle?
    // await storage.set('state', global.state);
});

ipcMain.on('redux-action', (event, payload) => {
  store.dispatch(payload);
});

ipcMain.on('redux-register', (event, id, payload) => {
  global.renderers[id] = payload;
});

let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function doCreateMainWindow() {
  mainWindow = createWindow({ store });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

app.on('ready', async () => {
  await installExtensions();

  doCreateMainWindow();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    doCreateMainWindow();
  }
});
