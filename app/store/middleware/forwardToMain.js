import { ipcRenderer } from 'electron';

const forwardToMain = () => next => action => {
  if (
    (typeof action) === 'object' &&
    (
      !action.meta ||
      !action.meta.scope ||
      action.meta.scope !== 'local'
    )
  ) {
    ipcRenderer.send('redux-action', action);

    // stop action in-flight
    return;
  }

  return next(action);
};

export default forwardToMain;
