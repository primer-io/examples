import React from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';
import { App } from './App.tsx';
import '@primer-io/goat/build/style.css';
import './styles/bootstrap.min.css';
import './styles/main.scss';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig
      value={{
        errorRetryCount: 10,
        onError: (error) => {
          // Log the error to the console.
          console.error(error);
        },
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          // Never retry on 4xx errors.
          if (error.status >= 400 && error.status < 500) return;
          // Only retry up to 5 times.
          if (retryCount >= 5) return;
          // Retry after 5 seconds.
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SWRConfig>
  </React.StrictMode>,
);
