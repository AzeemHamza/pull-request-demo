import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProviderWrapper } from './context/ThemeContext';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProviderWrapper>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>
);