import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import path from 'path';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Markdown from '../../main/utils/markdown';

// Utilities
import { setStyle, getScreenSize } from '../utils';
import { renderTheme } from '../theme';

// Selectors
import { getEditor } from '../../editor/selectors';

const UUID = remote.getCurrentWindow().uuid;

class Editor extends Component {
  static propTypes = {
    code: PropTypes.string,
    workingFile: PropTypes.string,
    clearSettings: PropTypes.func,
    addSetting: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.theme = null;
    this.state = {};
  }

  componentDidMount() {
    this.applyScreenSize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
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
    // $('#container').toggleClass 'height-base', size.ratio > getSlideSize().ratio
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
    };
  },
  dispatch => bindActionCreators({}, dispatch)
)(Editor);
