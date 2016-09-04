import path from 'path';
import postcss from 'postcss';
import precss from 'precss';
import postcssMixins from 'postcss-mixins';
import postcssPartialImport from 'postcss-partial-import';

import { setStyle } from './utils';
import { exists, loadFromFile, getAppPath } from '../main/utils/file';

const getProcessor = () => {
  const processor = postcss([
    postcssPartialImport({
      dirs: [
        path.join(getAppPath(), 'themes'),
        path.join(getAppPath(), 'node_modules/highlight.js/styles'),
      ]
    }),
    postcssMixins,
    precss({
      properties: { disable: true },
      mixins: { disable: true },
      import: { disable: true },
    })
  ]);

  return processor;
};

export const parseTheme = (css, file) =>
  getProcessor().process(css, { from: file })
    .then(result => result.css);

export const renderTheme = (key, dir) => {
  let file = path.join(dir, `${key}.css`);
  if (!exists(file)) {
    file = path.join(getAppPath(), 'themes', `${key}.css`);
  }
  if (!exists(file)) {
    file = path.join(getAppPath(), 'themes/default.css');
  }
  if (!exists(file)) {
    throw new Error(`Cannot find ${file}`);
  }

  loadFromFile(file)
    .then(data => parseTheme(data, file))
    .then(css => setStyle('theme', css));
};

export default {
  parseTheme,
  renderTheme,
};
