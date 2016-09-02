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
import { getCode } from '../selectors';

const UUID = remote.getCurrentWindow().uuid;

class Editor extends Component {
  static propTypes = {
    code: PropTypes.string,
    updateCode: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      code: this.props.code,
    };
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
  state => ({
    code: getCode(UUID)(state),
  }),
  dispatch => bindActionCreators({
    updateCode,
  }, dispatch)
)(Editor);
