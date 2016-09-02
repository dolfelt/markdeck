import {
  LOAD_FILE,
  SAVE_FILE,
  UPDATE_CODE,
} from '../store/actionTypes';

export default function editor(state = {}, action) {
  const uuid = action.uuid;
  switch (action.type) {
    case UPDATE_CODE:
      return {
        ...state,
        [uuid]: {
          ...state[uuid],
          code: action.code,
          saved: false,
        }
      };
    case LOAD_FILE:
      return {
        ...state,
        [uuid]: {
          ...state[uuid],
          code: action.code,
          file: action.file,
          saved: true,
        }
      };
    case SAVE_FILE:
      return {
        ...state,
        [uuid]: {
          ...state[uuid],
          file: action.file || state[uuid].file,
          saved: true,
        }
      };
    default:
      return state;
  }
}
