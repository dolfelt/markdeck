
export const getEditor = (uuid) => (state) => state.editor[uuid];

export const getCode = (uuid) => (state) => (getEditor(uuid)(state) || {}).code;

export default {
  getCode,
};
