import './App.css';
import {Page, Tabs, Spacer} from '@geist-ui/react';  
import {Navbar} from './common/Navbar';
import './common/globals.css';
import {AdminPage} from './common/Admin'

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

function App() {
  return (
    <>
      <Navbar />
      <Spacer h={3}/>
      <Page>
        <Tabs initialValue="1">
          <Tabs.Item label="Project Gallery" value="1">
            View all projects submitted to this event.
          </Tabs.Item>
          <Tabs.Item label="My Projects" value="2">
            Form to submit/edit your team's project for this event.
          </Tabs.Item>
          <Tabs.Item label="Admin" value="3">
            <AdminPage />
          </Tabs.Item>
        </Tabs>
      </Page>
    </>
  );
}

export default App;
