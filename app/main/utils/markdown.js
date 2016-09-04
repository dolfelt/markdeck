import markdownIt from 'markdown-it';
import HighlightJs from 'highlight.js';

import markdownItMark from 'markdown-it-mark';
import markdownItEmoji from 'markdown-it-emoji';
import markdownItKatex from 'markdown-it-katex';

import { exists } from './file';

import Settings from './settings';

const getHighlighter = (code, lang) => {
  if (lang) {
    if (lang === 'text' || lang === 'plain') {
      return '';
    } else if (HighlightJs.getLanguage(lang)) {
      try {
        return HighlightJs.highlight(lang, code).value;
      } catch (e) { /* nothing */ }
    }
  }
  return HighlightJs.highlightAuto(code).value;
};

const MARKDOWN_OPTIONS = {
  html: true,
  xhtmlOut: true,
  breaks: true,
  linkify: true,
  highlight: getHighlighter,
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
    return this.postRender([
      slideTagOpen(1),
      this.markdown.render(code),
      slideTagClose(this.rulers.length + 1)
    ].join(''));
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
          return defaultRenderers.image.apply(this, args);
        },
        html_block: (...args) => {
          this.renderers.html_block.apply(this, args);
          return defaultRenderers.html_block.apply(this, args);
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

  parents(node, cls) {
    const elm = node.parentNode;
    if (elm.classList.contains(cls)) {
      return elm;
    }
    return this.parents(elm, cls);
  }

  postRender(htmlString) {
    const content = document.createElement('div');
    content.innerHTML = htmlString;

    content.querySelectorAll('p > img[alt~="bg"]').forEach((elem) => {
      const parent = elem.parentNode;
      const slide = this.parents(elem, 'slide_wrapper');
      const bg = slide.querySelector('.slide_bg');
      const src = elem.src;
      const alt = elem.getAttribute('alt');
      const elmBg = document.createElement('div');
      elmBg.classList.add('slide_bg_img');
      elmBg.style.backgroundImage = `url(${src})`;
      elmBg.setAttribute('data-alt', alt);

      alt.split(/\s+/).forEach((opt) => {
        const m = opt.match(/^(\d+(?:\.\d+)?)%$/);
        if (m) {
          elmBg.style.backgroundSize = `${m[1]}%`;
        }
      });

      bg.appendChild(elmBg);
      parent.removeChild(elem);

      if (
        parent.querySelectorAll(':scope > :not(br)').length === 0 &&
        /^\s*$/.test(parent.textContent)
      ) {
        parent.parentNode.removeChild(parent);
      }
    });

    content.querySelectorAll('img[alt*="%"]').forEach((img) => {
      const imgTag = img;
      imgTag.getAttribute('alt').split(/\s+/).forEach((opt) => {
        const m = opt.match(/^(\d+(?:\.\d+)?)%$/);
        if (m) {
          imgTag.style.zoom = parseFloat(m[1]) / 100.0;
        }
      });
    });

    content.querySelectorAll(':scope > .slide_wrapper').forEach((wrapper) => {
      // Page directives for themes
      const page = parseInt(wrapper.id, 10);
      const settings = this.settings.getAt(page, false);
      Object.keys(settings).forEach((prop) => {
        const val = settings[prop];
        if (prop === 'footer') {
          const footers = wrapper.querySelectorAll('footer.slide_footer');
          if (footers.length) {
            footers[footers.length - 1].innerHTML = val;
          }
        } else {
          wrapper.setAttribute(`data-${prop}`, val);
        }
      });

      // Detect "only-***" elements
      const innerIgnore = [
        'base', 'link', 'meta', 'noscript', 'script',
        'style', 'template', 'title'].map(ignore => `:not(${ignore})`);
      const inner = wrapper.querySelector('.slide > .slide_inner');
      const innerContents = inner.querySelectorAll(
        `:scope > ${innerIgnore.join('')}`
      );

      const headsLength = inner.querySelectorAll(':scope > h1,h2,h3,h4,h5,h6').length;
      wrapper.classList.toggle(
        'only-headings',
        headsLength > 0 && innerContents.length === headsLength
      );

      const quotesLength = inner.querySelectorAll(':scope > blockquote').length;
      wrapper.classList.toggle(
        'only-blockquotes',
        quotesLength > 0 && innerContents.length === quotesLength
      );
    });

    return content.innerHTML;
  }
}
