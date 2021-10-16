import {Tabs} from '@geist-ui/react';  
import './common/globals.css';
import {AdminPage} from './common/Admin'
import {ProjectPage} from './common/Project'
import {GalleryPage} from './common/Gallery'
import { useHistory } from "react-router-dom";

import {
  useParams
} from "react-router-dom";

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

function Switcher() {
    let history = useHistory();
    let { id } = useParams();
    return (
      <>
        <Tabs initialValue="gallery" value={id} onChange={(id) => history.push("/bulletin/" + id)}>
            <Tabs.Item label="Project Gallery" value="gallery">
              <GalleryPage />
            </Tabs.Item>
            <Tabs.Item label="My Projects" value="submissions">
              <ProjectPage />
            </Tabs.Item>
            <Tabs.Item label="Admin" value="admin">
              <AdminPage />
            </Tabs.Item>
        </Tabs>
      </>
    );
  }

export default Switcher;
