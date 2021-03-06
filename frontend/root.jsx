import React from 'react'
import { Route, HashRouter, Switch } from 'react-router-dom';
import Schools from './schools'
import Selected from './selected'
import ShowSchool from './showSchool'
import Header from './header'
import Footer from './footer'

const Root = () => (
  <HashRouter>
    <div>
      <Header />
      <Switch>
        <Route exact path="/" component={Schools} />
        <Route exact path="/selected" component={Selected} />
        <Route exact path="/show" component={ShowSchool} />
      </Switch>
      <Footer />
      
      
    </div>
  </HashRouter>
);

export default Root