import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import { UserProvider } from './common/UserProvider'

ReactDOM.render(
  <React.StrictMode>
    <GeistProvider>
      <UserProvider>
        <CssBaseline />
        <App />
      </UserProvider>
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
