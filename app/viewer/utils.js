export const setStyle = (identifier, css) => {
  const id = `slide-${identifier}-style`;
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    style.type = 'text/css';
    document.head.appendChild(style);
  } else {
    style.removeChild(style.childNodes[0]);
  }
  style.appendChild(document.createTextNode(css));
};

export const getCSSvar = (prop) =>
  document.defaultView.getComputedStyle(document.body).getPropertyValue(prop);

export const getSlideSize = () => {
  const size = {
    w: getCSSvar('--slide-width'),
    h: getCSSvar('--slide-height'),
  };
  size.ratio = size.w / size.h;
  return size;
};

export const getScreenSize = () => {
  const size = {
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  };
  const previewMargin = getCSSvar('--preview-margin');
  size.ratio = (size.w - (previewMargin * 2)) / (size.h - (previewMargin * 2));
  return size;
};

export default {};
