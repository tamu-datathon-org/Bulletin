import './App.css';
import {Page, Spacer} from '@geist-ui/react';  
import { CookiesProvider } from 'react-cookie';
import {Navbar} from './common/Navbar';
import {ProjectView} from './common/ProjectView';
import './common/globals.css';
import Switcher from './Switcher'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

function App() {
  return (
    <>
      <Router>
        <CookiesProvider>
        <Navbar />
        <Spacer h={3}/>
        <Page>
        <Switch>
          <Route path="/bulletin/project/:id" children={<ProjectView />} />
          <Route path="/bulletin/:id" children={<Switcher />} />
          <Route path="/bulletin" children={<Switcher />} />
        </Switch>
        </Page>
        </CookiesProvider>
      </Router>
    </>
  );
}

export default App;
