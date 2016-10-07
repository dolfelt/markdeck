import { app, shell, Menu } from 'electron';

import Window from './Window';

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
          click: () => new Window({ store }),
        },
        { type: 'separator' },
        {
          label: '&Open',
          accelerator: 'CmdOrCtrl+O',
          click: (item, focusedWindow) => {
            let mdWindow;
            if (focusedWindow) {
              mdWindow = focusedWindow.getClass();
            }
            Window.loadFile(mdWindow);
          }
        },
        {
          label: '&Save',
          accelerator: 'CmdOrCtrl+S',
          click: (item, focusedWindow) =>
            focusedWindow && focusedWindow.getClass().saveFile(),
        },
        {
          label: 'Save As...',
          accelerator: 'Shift+CmdOrCtrl+S',
          click: (item, focusedWindow) =>
            focusedWindow && focusedWindow.getClass().saveFile(true),
        },
        { type: 'separator' },
        {
          label: 'Presentation Mode',
          accelerator: 'CmdOrCtrl+P',
          click: (item, focusedWindow) =>
            focusedWindow && focusedWindow.getClass().presentationMode(),
        },
        {
          label: 'Export to PDF...',
          accelerator: 'Shift+CmdOrCtrl+E',
          click: (item, focusedWindow) =>
            focusedWindow && focusedWindow.getClass().exportPdfDialog(),
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
        click: (_, focusedWindow) =>
          focusedWindow && focusedWindow.webContents.reload(),
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+CmdOrCtrl+F',
        click: (_, focusedWindow) =>
          focusedWindow && focusedWindow.setFullScreen(!focusedWindow.isFullScreen()),
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: (_, focusedWindow) =>
          focusedWindow && focusedWindow.toggleDevTools(),
      }, {
        label: 'Toggle Markdown Tools',
        accelerator: 'Alt+CmdOrCtrl+Shift+I',
        click: (_, focusedWindow) =>
          focusedWindow && focusedWindow.webContents.send('toggle-webview-devtools'),
      }] : [{
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+CmdOrCtrl+F',
        click: (_, focusedWindow) =>
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen()),
      }]
    },
  ];

  const helpMenu = {
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
  };

  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Markdeck',
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
      helpMenu,
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      ...baseTemplate
    }, helpMenu];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
}
