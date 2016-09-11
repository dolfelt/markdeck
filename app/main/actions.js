import {
  WILL_QUIT,
  QUIT_CANCELLED,
  WINDOW_CLOSED
} from '../store/actionTypes';

export function windowClosed(uuid) {
  return {
    type: WINDOW_CLOSED,
    uuid,
  };
}

export function willQuit() {
  return {
    type: WILL_QUIT,
  };
}

export function quitCancelled() {
  return {
    type: QUIT_CANCELLED,
  };
}
