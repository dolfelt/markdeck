import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './editor/containers/App';
import MainPanel from './editor/containers/MainPanel';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={MainPanel} />
  </Route>
);
