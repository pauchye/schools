import React from 'react'
import { Route, HashRouter } from 'react-router-dom';
import Schools from './schools'
import Selected from './selected'
import ShowSchool from './showSchool'

const Root = () => (
  <HashRouter>
    <div>
      {/* <Header /> */}
      <Route exact path="/" component={Schools} />
      <Route exact path="/selected" component={Selected} />
      <Route exact path="/show" component={ShowSchool} />
    </div>
  </HashRouter>
);

export default Root