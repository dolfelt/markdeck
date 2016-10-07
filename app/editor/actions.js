import {
  UPDATE_CODE,
  LOAD_FILE,
  SAVE_FILE,
  EDITOR_LOADING,
  EXPORT_PDF,
  EXPORT_PDF_COMPLETE,
  PRESENTATION_MODE,
  SET_CURRENT_PAGE,
  SET_TOTAL_PAGES,
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

export function exportPdf(uuid) {
  return (dispatch) => Promise.all([
    dispatch(isLoading(uuid, true)),
    dispatch({
      type: EXPORT_PDF,
      uuid,
    }),
  ]);
}

export function presentationMode(uuid, presenting) {
  return {
    type: PRESENTATION_MODE,
    uuid,
    presenting,
  };
}

export function setCurrentPage(uuid, page) {
  return {
    type: SET_CURRENT_PAGE,
    uuid,
    page,
  };
}

export function setTotalPages(uuid, pages) {
  return {
    type: SET_TOTAL_PAGES,
    uuid,
    pages,
  };
}

export function exportPdfComplete(uuid, file) {
  return (dispatch) => Promise.all([
    dispatch(isLoading(uuid, false)),
    dispatch({
      type: EXPORT_PDF_COMPLETE,
      uuid,
      file,
    }),
  ]);
}

export function isLoading(uuid, status = true) {
  return {
    type: EDITOR_LOADING,
    uuid,
    status,
  };
}
