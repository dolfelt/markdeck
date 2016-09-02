import {
  UPDATE_CODE,
  LOAD_FILE,
  SAVE_FILE,
} from '../store/actionTypes';

import { loadFromFile, saveToFile } from '../main/utils/file';

export function updateCode(uuid, code) {
  return {
    type: UPDATE_CODE,
    code,
    uuid,
  };
}

export function loadFile(uuid, file) {
  return (dispatch) => {
    loadFromFile(file).then((code) => {
      dispatch({
        type: LOAD_FILE,
        file,
        code,
        uuid,
      });
    });
  };
}

export function saveFile(uuid, file, data) {
  return (dispatch) =>
    saveToFile(file, data).then(() => {
      dispatch({
        type: SAVE_FILE,
        uuid,
        file,
      });
    });
}
