import React, { Component, PropTypes } from 'react';
import { remote, ipcRenderer as ipc } from 'electron';
import path from 'path';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Markdown from '../../main/utils/markdown';

// Utilities
import { setStyle, getScreenSize, getSlideSize } from '../utils';
import { renderTheme } from '../theme';

// Selectors
import { getEditor } from '../../editor/selectors';

const UUID = remote.getCurrentWindow().uuid;

class Viewer extends Component {
  static propTypes = {
    code: PropTypes.string,
    workingFile: PropTypes.string,
    clearSettings: PropTypes.func,
    addSetting: PropTypes.func,
    presenting: PropTypes.bool,
    currentPage: PropTypes.number,
    viewMode: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.theme = null;
    this.state = {};
  }

  componentDidMount() {
    this.setPresenting(this.props.presenting);
    setTimeout(() => this.applyScreenSize(), 1000);
    window.addEventListener('resize', this.handleResize);
    this.applyCurrentPage(this.props.currentPage);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentPage !== nextProps.currentPage) {
      this.applyCurrentPage(nextProps.currentPage);
    }
    if (this.props.presenting !== nextProps.presenting) {
      this.setPresenting(nextProps.presenting);
    }
    if (this.props.viewMode !== nextProps.viewMode) {
      this.setViewMode(nextProps.viewMode);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.setPresenting(false);
  }

  setViewMode = (mode) => {
    document.body.classList.toggle('list', mode === 'list');
    document.body.classList.toggle('screen', mode === 'screen');
  }

  setPresenting = (presenting) => {
    const mode = presenting ? 'screen' : this.props.viewMode;
    this.setViewMode(mode);

    if (presenting) {
      setStyle('presentationMode', `body {
        --preview-margin: 0;
      }`);
      this.applyCurrentPage(this.props.currentPage);
    } else {
      setStyle('presentationMode', '');
    }
  }

  handleResize = () => {
    this.applyScreenSize();
  }

  applyScreenSize() {
    const size = getScreenSize();
    setStyle('screenSize', `body {
      --screen-width: ${size.w};
      --screen-height: ${size.h};
    }`);
    const container = document.getElementById('container');
    if (container) {
      container.classList.toggle('height-base', size.ratio > getSlideSize().ratio);
    }
  }

  applyCurrentPage(page) {
    setStyle('currentPage', `
      @media not print {
        body.slide-view.screen .slide_wrapper:not(:nth-of-type(${page})) {
          width: 0 !important;
          height: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
      }`
    );
  }

  applySlideSize(width, height) {
    setStyle('slideSize', `body {
      --slide-width: ${width || 'inherit'};
      --slide-height: ${height || 'inherit'};
    }`);
    this.applyScreenSize();
  }

  themePath() {
    if (this.props.workingFile) {
      return path.dirname(this.props.workingFile);
    }
    return path.resolve('themes');
  }

  workingDir() {
    if (!this.props.workingFile) {
      return null;
    }
    return path.dirname(this.props.workingFile);
  }

  renderMarkdown() {
    this.markdown = new Markdown({
      workingDir: this.workingDir(),
    });
    const render = this.markdown.render(this.props.code || '');
    const settings = this.markdown.getSettings();

    ipc.sendToHost('pageData', this.markdown.getRulers());

    this.applySlideSize(settings.getGlobal('width'), settings.getGlobal('height'));

    const newTheme = settings.getGlobal('theme') || 'default';
    if (newTheme !== this.theme) {
      this.theme = newTheme;
      renderTheme(
        newTheme,
        this.themePath()
      );
    }

    return {
      __html: render,
    };
  }

  renderSlides() {
    return (
      <div dangerouslySetInnerHTML={this.renderMarkdown()} />
    );
  }

  render() {
    return (
      <div id="container">
        <div className="viewer-box markdown-body">
          { this.renderSlides() }
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    const editor = getEditor(UUID)(state) || {};
    return {
      code: editor.code || '',
      workingFile: editor.file,
      presenting: editor.presenting,
      viewMode: editor.viewMode || 'screen',
      currentPage: editor.currentPage || 1,
    };
  },
  dispatch => bindActionCreators({}, dispatch)
)(Viewer);
