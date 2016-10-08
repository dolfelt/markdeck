import {
  LOAD_FILE,
  SAVE_FILE,
  UPDATE_CODE,
  WINDOW_CLOSED,
  EDITOR_LOADING,
  EXPORT_PDF,
  EXPORT_PDF_COMPLETE,
  PRESENTATION_MODE,
  SET_CURRENT_PAGE,
  SET_TOTAL_PAGES,
  VIEW_MODE,
} from '../store/actionTypes';

const saveUuidState = (state, uuid) => (data) => ({
  ...state,
  [uuid]: {
    ...state[uuid],
    ...data
  }
});

export default function editor(state = {}, action) {
  const uuid = action.uuid;
  const save = saveUuidState(state, uuid);
  switch (action.type) {
    case UPDATE_CODE:
      return save({
        code: action.code,
        saved: false,
      });
    case LOAD_FILE:
      return save({
        code: action.code,
        file: action.file,
        saved: true,
      });
    case SAVE_FILE:
      return save({
        file: action.file || state[uuid].file,
        saved: true,
      });
    case EXPORT_PDF:
      return save({
        export: {
          loading: true,
        }
      });
    case EXPORT_PDF_COMPLETE:
      return save({
        export: {
          loading: false,
          file: action.file,
        }
      });
    case PRESENTATION_MODE:
      return save({
        presenting: action.presenting,
      });
    case SET_CURRENT_PAGE:
      return save({
        currentPage: action.page,
      });
    case SET_TOTAL_PAGES:
      return save({
        totalPages: action.pages,
        pageRulers: action.rulers,
      });
    case VIEW_MODE:
      return save({
        viewMode: action.mode,
      });
    case WINDOW_CLOSED: {
      const copy = { ...state };
      delete copy[uuid];
      return copy;
    }
    case EDITOR_LOADING:
      return save({
        loading: action.status,
      });
    default:
      return state;
  }
}
