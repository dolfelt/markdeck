import markdownIt from 'markdown-it';
import HighlightJs from 'highlight.js';

import markdownItMark from 'markdown-it-mark';
import markdownItEmoji from 'markdown-it-emoji';
import markdownItKatex from 'markdown-it-katex';

import { exists } from './file';

import Settings from './settings';

const MARKDOWN_OPTIONS = {
  html: true,
  xhtmlOut: true,
  breaks: true,
  linkify: true,
  highlight: getHighligher,
};

const getHighligher = (code, lang) => {
  if (lang) {
    if (lang === 'text' || lang === 'plain') {
      return '';
    } else if (HighlightJs.getLanguage(lang)) {
      try {
        return HighlightJs.highlight(lang, code).value;
      } finally { /* nothing */ }
    }
  }
  return HighlightJs.highlightAuto(code).value;
};

const slideTagOpen = (page) =>
  `<div class="slide_wrapper" id="${page}">
  <div class="slide"><div class="slide_bg"></div>
  <div class="slide_inner">`;
const slideTagClose = (page) =>
  `</div><footer class="slide_footer"></footer>
  <span class="slide_page" data-page="${page}">${page}</span>
  </div></div>`;


export default class Markdown {
  constructor() {
    this.settings = new Settings();

    this.rulers = [];

    this.markdown = this.createMarkdown(
      MARKDOWN_OPTIONS,
      [
        markdownItMark,
        [markdownItEmoji, { shortcuts: {} }],
        markdownItKatex,
      ]
    );
    this.setupMarkdownRules(this.markdown);
  }

  getSettings() {
    return this.settings;
  }

  render(code) {
    this.rulers = [];
    return [
      slideTagOpen(1),
      this.markdown.render(code),
      slideTagClose(this.rulers.length + 1)
    ].join('');
  }

  createMarkdown(opts, plugins = []) {
    const markdown = markdownIt(opts);
    plugins.forEach((plugin) => markdown.use(plugin[0] || plugin, plugin[1] || {}));
    return markdown;
  }

  setupMarkdownRules(markdown) {
    const { rules } = markdown.renderer;

    const defaultRenderers = {
      image: rules.image,
      html_block: rules.html_block,
    };

    Object.assign(
      rules,
      {
        // emoji: (token, idx) => twemoji.parse(token[idx].content, @twemojiOpts),
        hr: (token, idx) => {
          const ruler = this.rulers || [];
          ruler.push(token[idx].map[0]);
          return [
            slideTagClose(ruler.length || ''),
            slideTagOpen(ruler.length + 1 || ''),
          ].join('');
        },
        image: (...args) => {
          this.renderers.image.apply(this, args);
          defaultRenderers.image.apply(this, args);
        },
        html_block: (...args) => {
          this.renderers.html_block.apply(this, args);
          defaultRenderers.html_block.apply(this, args);
        },
      }
    );
  }

  renderers = {
    image: (tokens, idx) => {
      const tok = tokens;
      const src = decodeURIComponent(tokens[idx].attrs[tokens[idx].attrIndex('src')][1]);
      if (exists(src)) {
        tok[idx].attrs[tokens[idx].attrIndex('src')][1] = src;
      }
    },
    html_block: (tokens, idx) => {
      const { content } = tokens[idx];
      if (content.substring(0, 3) !== '<!-') {
        return;
      }

      const matched = /^(<!-{2,}\s*)([\s\S]*?)\s*-{2,}>$/m.exec(content);
      if (matched) {
        const spaceLines = matched[1].split('\n');
        let lineIndex = tokens[idx].map[0] + (spaceLines.length - 1);
        let startFrom = spaceLines[spaceLines.length - 1].length;

        matched[2].split('\n').forEach(matchedLine => {
          const parsed = /^(\s*)(([\$\*]?)(\w+)\s*:\s*(.*))\s*$/.exec(matchedLine);

          if (parsed) {
            startFrom += parsed[1].length;
            const pageIdx = this.rulers.length || 0;

            if (parsed[3] === '$') {
              this.settings.set(0, parsed[4], parsed[5]);
            } else {
              this.settings.set(pageIdx + 1, parsed[4], parsed[5], parsed[3] === '*');
            }

            /* @settingsPosition.push
              pageIdx: pageIdx
              lineIdx: lineIndex
              from: startFrom
              length: parsed[2].length
              property: "#{parsed[3]}#{parsed[4]}"
              value: parsed[5] */
          }
          lineIndex++;
          startFrom = 0;
        });
      }
    },
  }
}
