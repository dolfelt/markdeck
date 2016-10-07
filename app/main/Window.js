import { BrowserWindow, Menu, dialog, app, ipcRenderer as ipc } from 'electron';
import path from 'path';

import { getAppPath, saveToFile } from './utils/file';
import guid from './utils/guid';
import createMenu from './createMenu';

import { loadFile, saveFile } from '../editor/actions';
import { windowClosed } from './actions';

import { getEditor } from '../editor/selectors';

export default class Window {
  constructor({ store, options }) {
    this.store = store;
    this.window = new BrowserWindow({
      show: false,
      width: 1024 || options.width,
      height: 728 || options.height,
    });

    const appPath = getAppPath();
    this.window.loadURL(`file://${appPath}/app/app.html`);
    this.uuid = this.window.uuid = guid();

    this.attachEvents();

    createMenu({
      store: this.store,
      mainWindow: this.window,
    });

    this.window.getClass = () => this;
  }

  events = {
    close: (e) => {
      e.preventDefault();

      const editor = this.getEditorState();
      const doClose = () => {
        this.dispatch(windowClosed(this.uuid));
        this.window.destroy();
        if (global.isQuitting) {
          app.quit();
        }
      };

      if (editor.saved !== false) {
        return doClose();
      }

      const filename = path.basename(editor.file || '') || 'Untitled.md';

      dialog.showMessageBox(
        this.window,
        {
          type: 'question',
          buttons: ['Yes', 'No', 'Cancel'],
          title: 'Markdeck',
          message: 'Are you sure?',
          detail: `${filename} has been modified. Do you want to save the changes?`
        },
        (result) => {
          switch (result) {
            case 0:
              // TODO: Do save and close
              // doClose()
              break;
            case 1:
              doClose();
              break;
            default:
              global.isQuitting = false;
              return;
          }
        }
      );
    }
  }

  webEvents = {
    'context-menu': (e, props) => {
      const { x, y } = props;

      if (process.env.NODE_ENV === 'development') {
        Menu.buildFromTemplate([{
          label: 'Inspect element',
          click() {
            this.window.inspectElement(x, y);
          }
        }]).popup(this.window);
      }
    },
    'did-finish-load': () => {
      this.show();
    }
  }

  attachEvents() {
    Object.keys(this.webEvents).forEach(event => {
      this.window.webContents.on(event, this.webEvents[event]);
    });

    Object.keys(this.events).forEach(event => {
      this.window.on(event, this.events[event]);
    });

    this.window.dispatch = (action) => this.dispatch(action);

    this.window.getState = () => this.store.getState();

    this.window.updateTitle = () => {
      const editor = this.getEditorState();
      const title = path.basename(editor.file || '') || 'Untitled';
      const unsaved = editor.saved ? '' : ' *';
      this.window.setTitle(`${title}${unsaved}`);
      if (process.platform === 'darwin') {
        this.window.setRepresentedFilename(editor.file || '');
        this.window.setDocumentEdited(!editor.saved);
      }
    };
  }

  dispatch(action) {
    this.store.dispatch(action);
  }

  getState() {
    return this.store.getState();
  }

  getEditorState() {
    return getEditor(this.uuid)(this.getState());
  }

  getSlideView() {
    return this.window.webContents.global.webview;
  }

  send(event, payload) {
    this.window.webContents.send(event, payload);
  }

  show() {
    this.window.show();
    this.window.focus();
  }

  getWindow() {
    return this.window;
  }

  // Application Events
  saveFile = (saveAs = false) => {
    const editor = this.getEditorState();

    const doSave = (file) => this.dispatch(saveFile(
      this.uuid,
      file,
      editor.code || ''
    ));

    const doSaveAs = () =>
      new Promise((resolve, reject) => {
        dialog.showSaveDialog(
          this.window,
          {
            title: 'Save as...',
            filters: [{ name: 'Markdown file', extensions: ['md'] }],
          },
          (filename) => {
            if (filename) {
              resolve(filename);
            } else {
              reject();
            }
          }
        );
      });

    if (editor.file && !saveAs) {
      doSave(editor.file);
    } else {
      doSaveAs()
        .then((filename) => doSave(filename));
    }
  }

  loadFile = (file) => {
    this.dispatch(loadFile(
      this.uuid,
      file
    ));
  }

  static loadFile(currentWindow) {
    const onOpen = (fnames) => {
      if (!fnames) return;

      let mdWindow;
      if (!currentWindow) {
        mdWindow = new Window({ store: global.getStore() });
      } else {
        mdWindow = currentWindow;
        const editor = mdWindow.getEditorState();
        if (editor.code) {
          mdWindow = new Window({ store: global.getStore() });
        }
      }

      mdWindow.loadFile(fnames[0]);
    };

    dialog.showOpenDialog(
      {
        title: 'Open',
        filters: [
          { name: 'Markdown files', extensions: ['md', 'mdown'] },
          { name: 'Text file', extensions: ['txt'] },
          { name: 'All files', extensions: ['*'] },
        ],
        properties: ['openFile', 'createDirectory']
      },
      onOpen
    );
  }

  exportPdfDialog = () => {
    dialog.showSaveDialog(
      this.window,
      {
        title: 'Export to PDF...',
        filters: [{ name: 'PDF file', extensions: ['pdf'] }],
      },
      (filename) => {
        if (!filename) return;
        // @freeze = true
        this.send('publishPdf', { filename });
      }
    );
  };

}
