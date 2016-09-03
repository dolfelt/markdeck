import { BrowserWindow, Menu, dialog } from 'electron';
import path from 'path';

import guid from './utils/guid';
import createMenu from './createMenu';

import { getEditor } from '../editor/selectors';

const getEditorState = (win) => getEditor(win.uuid)(win.getState());

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

  mainWindow.on('close', (e) => {
    const editor = getEditorState(mainWindow);

    if (editor.saved !== false) {
      return;
    }

    e.preventDefault();
    const filename = path.basename(editor.file || '') || 'Untitled.md';
    dialog.showMessageBox(
      mainWindow,
      {
        type: 'question',
        buttons: ['Yes', 'No', 'Cancel'],
        title: 'Marp',
        message: 'Are you sure?',
        detail: `${filename} has been modified. Do you want to save the changes?`
      },
      (result) => {
        switch (result) {
          case 0:
            // TODO: Do save and close
            break;
          case 1:
            mainWindow.destroy();
            break;
          default:
            return;
        }
      }
    );
  });

  createMenu({
    store,
    mainWindow,
  });

  mainWindow.updateTitle = () => {
    const editor = getEditorState(mainWindow);
    const title = path.basename(editor.file || '') || 'Untitled';
    const unsaved = editor.saved ? '' : ' *';
    mainWindow.setTitle(`${title}${unsaved}`);
    if (process.platform === 'darwin') {
      mainWindow.setRepresentedFilename(editor.file || '');
      mainWindow.setDocumentEdited(!editor.saved);
    }
  };

  mainWindow.dispatch = (action) => {
    store.dispatch(action);
  };

  mainWindow.getState = () => store.getState();

  return mainWindow;
}
