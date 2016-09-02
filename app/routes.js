import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './main/containers/App';
import MainPanel from './main/containers/MainPanel';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={MainPanel} />
  </Route>
);
