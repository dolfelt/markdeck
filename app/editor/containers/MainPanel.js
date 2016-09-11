import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SplitPane from 'react-split-pane';

import Editor from '../../editor/containers/Editor';
import Pipe from '../Pipe';

class MainPanel extends Component {

  constructor(props) {
    super(props);

    this.pipe = new Pipe();
  }

  componentDidMount() {
    this.webview = this.div.childNodes[0];
    global.webview = this.webview;

    this.pipe.connect(this.webview);
  }

  componentWillUnmount() {
    this.pipe.disconnect();
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
  render() {
    return (
      <SplitPane defaultSize="50%">
        <Editor />
        { this.renderWebview() }
      </SplitPane>
    );
  }
}

export default connect(
  (state) => ({
    code: state.editor.code,
  }),
  dispatch => bindActionCreators({}, dispatch)
)(MainPanel);
