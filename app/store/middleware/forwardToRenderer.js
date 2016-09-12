import { BrowserWindow } from 'electron';

const forwardToRenderer = () => next => action => {
  // change scope to avoid endless-loop
  const rendererAction = {
    ...action,
    meta: {
      ...action.meta,
      scope: 'local',
    },
  };

  const sendEvent = (view) => {
    view.send('redux-action', rendererAction);
  };

  // Only send objects across IPC
  if ((typeof action) === 'object') {
    const openWindows = BrowserWindow.getAllWindows();
    openWindows.forEach(({ uuid, webContents }) => {
      if (!rendererAction.uuid || uuid === rendererAction.uuid) {
        sendEvent(webContents);
      }
    });
  }

  return next(action);
};

export default forwardToRenderer;
