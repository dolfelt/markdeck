import {
  WILL_QUIT,
  QUIT_CANCELLED,
} from '../store/actionTypes';

export default function main(state = {}, action) {
  switch (action.type) {
    case WILL_QUIT:
      return {
        ...state,
        willQuit: true,
      };
    case QUIT_CANCELLED:
      return {
        ...state,
        willQuit: false,
      };
    default:
      return state;
  }
}
