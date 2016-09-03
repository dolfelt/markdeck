import { BrowserWindow, Menu } from 'electron';
import path from 'path';

import guid from './utils/guid';
import createMenu from './createMenu';

const mainWindowPath = path.join(__dirname, '../../app/app.html');

export default function createWindow({ store }) {
  const mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${mainWindowPath}`);

  mainWindow.uuid = guid();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }

  createMenu({
    store,
    mainWindow,
  });

  mainWindow.dispatch = (action) => {
    store.dispatch(action);
  };

  mainWindow.getState = () => store.getState();

  return mainWindow;
}
