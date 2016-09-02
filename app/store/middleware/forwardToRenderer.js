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

  /* Object.keys(global.renderers).forEach((key) => {
    sendEvent(global.renderers[key]);
  }); */
  const openWindows = BrowserWindow.getAllWindows();
  openWindows.forEach(({ uuid, webContents }) => {
    if (!rendererAction.uuid || uuid === rendererAction.uuid) {
      sendEvent(webContents);
    }
  });

  return next(action);
};

export default forwardToRenderer;
