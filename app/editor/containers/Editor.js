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
import { updateCode, setCurrentPage } from '../actions';

// Selectors
import { getEditor } from '../selectors';

const UUID = remote.getCurrentWindow().uuid;

class Editor extends Component {
  static propTypes = {
    code: PropTypes.string,
    file: PropTypes.string,
    saved: PropTypes.bool,
    presenting: PropTypes.bool,
    rulers: PropTypes.array,
    updateCode: PropTypes.func,
    setCurrentPage: PropTypes.func,
  }

  constructor(props) {
    super(props);

    remote.getCurrentWindow().updateTitle();

    this.state = {
      code: this.props.code,
    };
  }

  componentDidMount() {
    this.codeMirror.on(
      'cursorActivity',
      () => setTimeout(this.refreshPage, 5)
    );
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

  refreshPage = () => {
    if (this.props.presenting || !this.codeMirror) {
      return;
    }

    const lineNumber = this.codeMirror.getCursor().line || 0;
    const line = this.props.rulers.filter((ln) => ln <= lineNumber);
    const page = line.length + 1;

    this.props.setCurrentPage(UUID, page);

    // TODO: Update page indicator `Page ${currentPage} / ${totalPages}`
  }

  render() {
    return (
      <Codemirror
        ref={(code) => code && (this.codeMirror = code.getCodeMirror())}
        value={this.state.code}
        onChange={this.onCodeChange}
        options={{
          mode: 'gfm',
          theme: 'markdeck',
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
      rulers: editor.pageRulers,
      presenting: editor.presenting,
    };
  },
  dispatch => bindActionCreators({
    updateCode,
    setCurrentPage,
  }, dispatch)
)(Editor);
