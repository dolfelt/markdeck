import { remote } from 'electron';
import React, { Component, PropTypes } from 'react';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/addon/edit/continuelist';
import Codemirror from 'react-codemirror';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Actions
import { updateCode } from '../actions';

// Selectors
import { getEditor } from '../selectors';

const UUID = remote.getCurrentWindow().uuid;

class Editor extends Component {
  static propTypes = {
    code: PropTypes.string,
    file: PropTypes.string,
    saved: PropTypes.bool,
    updateCode: PropTypes.func,
  }

  constructor(props) {
    super(props);

    remote.getCurrentWindow().updateTitle();

    this.state = {
      code: this.props.code,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.file !== nextProps.file) {
      this.setState({
        code: nextProps.code,
      });
    }

    if (
      this.props.file !== nextProps.file ||
      this.props.saved !== nextProps.saved
    ) {
      remote.getCurrentWindow().updateTitle();
    }
  }

  onCodeChange = (code) => {
    this.setState({
      code,
    });

    this.props.updateCode(UUID, code);
  }

  render() {
    return (
      <Codemirror
        value={this.state.code}
        onChange={this.onCodeChange}
        options={{
          mode: 'gfm',
          theme: 'remarp',
          lineWrapping: true,
          lineNumbers: false,
          dragDrop: false,
          extraKeys: {
            Enter: 'newlineAndIndentContinueMarkdownList',
          }
        }}
      />
    );
  }
}

export default connect(
  state => {
    const editor = getEditor(UUID)(state);
    return {
      file: editor.file,
      code: editor.code,
      saved: editor.saved,
    };
  },
  dispatch => bindActionCreators({
    updateCode,
  }, dispatch)
)(Editor);
