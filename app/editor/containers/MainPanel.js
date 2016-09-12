import { remote } from 'electron';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import Editor from '../../editor/containers/Editor';
import Pipe from '../Pipe';

import { getEditor } from '../selectors';

import loaderSvg from '../../../assets/loading.svg';

class MainPanel extends Component {
  static propTypes = {
    pipe: PropTypes.object,
    exporting: PropTypes.bool,
  }

  componentDidMount() {
    this.webview = this.div.childNodes[0];
    global.webview = this.webview;

    this.props.pipe.connect(this.webview);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.exporting !== this.props.exporting) {
      document.body.classList.toggle('exporting-pdf', newProps.exporting);
    }
  }

  componentWillUnmount() {
    this.props.pipe.disconnect();
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
        ref={d => (this.div = d)}
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

  render() {
    return (
      <div>
        <SplitPane defaultSize="50%">
          <Editor />
          { this.renderWebview() }
        </SplitPane>
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
    };
  },
  dispatch => {
    return {
      pipe: new Pipe({ dispatch, uuid }),
    };
  }
)(MainPanel);
