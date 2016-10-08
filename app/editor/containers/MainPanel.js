import { remote } from 'electron';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SplitPane from 'react-split-pane';

import Editor from '../../editor/containers/Editor';
import Pipe from '../Pipe';

// Actions
import { setCurrentPage, presentationMode, setViewMode } from '../actions';

// Selectors
import { getEditor } from '../selectors';

import loaderSvg from '../../../assets/loading.svg';

class MainPanel extends Component {
  static propTypes = {
    pipe: PropTypes.object,
    exporting: PropTypes.bool,
    presenting: PropTypes.bool,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    viewMode: PropTypes.string,
    presentationMode: PropTypes.func,
    setCurrentPage: PropTypes.func,
    setViewMode: PropTypes.func,
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyPress);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.exporting !== this.props.exporting) {
      document.body.classList.toggle('exporting-pdf', newProps.exporting);
    }
  }

  componentWillUnmount() {
    this.props.pipe.disconnect();
    document.removeEventListener('keydown', this.keyPress);
  }

  keyPress = (event) => {
    if (!this.props.presenting) {
      return;
    }
    const code = event.keyCode;
    if (code === 27) {
      this.props.presentationMode(false);
    } else if (code === 37 || code === 39) {
      const diff = code === 37 ? -1 : 1;
      const page = Math.max(1, Math.min(this.props.totalPages, this.props.currentPage + diff));
      this.props.setCurrentPage(page);
    }
  }

  handleWebview = (div) => {
    if (div) {
      this.webview = div.childNodes[0];
      global.webview = this.webview;

      this.props.pipe.connect(this.webview);
    }
  }

  renderWebview() {
    const webview = (`<webview
        id="viewer"
        src="viewer.html"
        autosize="on"
        nodeintegration
        blinkfeatures="CSSVariables"
        style="height: 100%; width: 100%;"
      />`);

    return (
      <div
        ref={this.handleWebview}
        style={{ height: '100%' }}
        dangerouslySetInnerHTML={{ __html: webview }}
      />
    );
  }

  renderLoading() {
    return (
      <div className="loading">
        <div dangerouslySetInnerHTML={{ __html: loaderSvg }} />
      </div>
    );
  }

  renderPanels() {
    const presenting = this.props.presenting ? {
      pane1Style: { display: 'none' },
      resizerStyle: { display: 'none' },
      allowResize: false,
    } : {};

    const style = {
      position: 'static',
    };

    return (
      <SplitPane defaultSize="50%" {...presenting} style={style}>
        <Editor />
        { this.renderWebview() }
      </SplitPane>
    );
  }

  renderToolbar() {
    if (this.props.presenting) {
      return null;
    }

    const modes = [
      {
        icon: 'icon-monitor',
        key: 'screen',
      },
      {
        icon: 'icon-doc-text',
        key: 'list',
      }
    ].map(({ icon, key }) => {
      const active = key === this.props.viewMode ? ' active' : '';
      return (
        <button className={`btn btn-default${active}`} onClick={() => this.props.setViewMode(key)}>
          <span className={`icon ${icon}`} />
        </button>
      );
    });

    return (
      <footer className="toolbar toolbar-footer">
        <div className="toolbar-actions">
          <button className="btn btn-default" onClick={() => this.props.presentationMode(true)}>
            <span className="icon icon-play" /> Present
          </button>
          <div className="btn-group pull-right">
            { modes }
          </div>
        </div>
      </footer>
    );
  }

  render() {
    return (
      <div className="window-app-box">
        { this.renderPanels() }
        { this.renderToolbar() }
        { this.props.exporting ? this.renderLoading() : null }
      </div>
    );
  }
}

const uuid = remote.getCurrentWindow().uuid;
export default connect(
  (state) => {
    const editor = getEditor(uuid)(state);
    return {
      exporting: (editor.export || {}).loading || false,
      presenting: editor.presenting || false,
      viewMode: editor.viewMode || 'screen',
      currentPage: editor.currentPage || 1,
      totalPages: editor.totalPages || 1,
    };
  },
  (dispatch) => ({
    pipe: new Pipe({ dispatch, uuid }),
    ...bindActionCreators({
      setCurrentPage: setCurrentPage.bind(null, uuid),
      presentationMode: presentationMode.bind(null, uuid),
      setViewMode: setViewMode.bind(null, uuid),
    }, dispatch)
  })
)(MainPanel);
