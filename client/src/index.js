import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { GeistProvider, CssBaseline } from '@geist-ui/react';

ReactDOM.render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <App />
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
