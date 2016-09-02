import { app, shell, Menu, dialog } from 'electron';

import createWindow from './createWindow';
import { loadFile, saveFile } from '../editor/actions';
import { getEditor } from '../editor/selectors';

const onSaveFile = (focusedWindow, saveAs = false) => {
  const uuid = focusedWindow.uuid;
  const editor = getEditor(uuid)(focusedWindow.getState()) || {};

  const doSave = (file) => focusedWindow.dispatch(saveFile(
    focusedWindow.uuid,
    file,
    editor.code || ''
  ));

  if (editor.file && !saveAs) {
    doSave(editor.file);
  } else {
    doSaveAs(focusedWindow)
      .then((filename) => doSave(filename));
  }
};

const doSaveAs = (focusedWindow) =>
  new Promise((resolve, reject) => {
    dialog.showSaveDialog(
      focusedWindow,
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


export default function createMenu({
  store,
  mainWindow,
}) {
  let menu;
  let template;

  const baseTemplate = [
    {
      label: '&File',
      submenu: [
        {
          label: '&New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow({ store });
          }
        },
        { type: 'separator' },
        {
          label: '&Open',
          accelerator: 'CmdOrCtrl+O',
          click: (item, win) => {
            const args = [
              {
                title: 'Open',
                filters: [
                  { name: 'Markdown files', extensions: ['md', 'mdown'] },
                  { name: 'Text file', extensions: ['txt'] },
                  { name: 'All files', extensions: ['*'] },
                ],
                properties: ['openFile', 'createDirectory']
              },
              (fnames) => {
                if (!fnames) return;

                const focusedWindow = win || createWindow({ store });

                focusedWindow.dispatch(loadFile(
                  focusedWindow.uuid,
                  fnames[0]
                ));
              }
            ];

            dialog.showOpenDialog(...args);
          }
        },
        {
          label: '&Save',
          accelerator: 'CmdOrCtrl+S',
          click: (item, win) => {
            if (win) {
              onSaveFile(win);
            }
          }
        },
        {
          label: 'Save As...',
          accelerator: 'Shift+CmdOrCtrl+S',
          click: (item, win) => {
            if (win) {
              onSaveFile(win, true);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Export to PDF...',
          accelerator: 'Shift+CmdOrCtrl+E'
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }]
    },
    {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+CmdOrCtrl+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+CmdOrCtrl+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    },
  ];

  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Remarp',
        submenu: [{
          label: 'About',
          selector: 'orderFrontStandardAboutPanel:'
        }, {
          type: 'separator'
        }, {
          label: 'Services',
          submenu: []
        }, {
          type: 'separator'
        }, {
          label: 'Hide',
          accelerator: 'Command+H',
          selector: 'hide:'
        }, {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        }, {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() {
            app.quit();
          }
        }]
      },
      ...baseTemplate,
      {
        label: 'Window',
        submenu: [{
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        }, {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        }, {
          type: 'separator'
        }, {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }]
      },
      {
        label: 'Help',
        submenu: [{
          label: 'Learn More',
          click() {
            shell.openExternal('http://electron.atom.io');
          }
        }, {
          label: 'Documentation',
          click() {
            shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
          }
        }, {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://discuss.atom.io/c/electron');
          }
        }, {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/atom/electron/issues');
          }
        }]
      }
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      label: '&File',
      submenu: [{
        label: '&Open',
        accelerator: 'Ctrl+O'
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click() {
          mainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
}
