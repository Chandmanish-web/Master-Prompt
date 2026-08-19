import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import store from './redux/store';
import { setUserFromStorage } from './redux/authSlice';

const savedAuth = localStorage.getItem('worktrack-auth');
if (savedAuth) {
  try {
    const parsed = JSON.parse(savedAuth);
    if (parsed?.token && parsed?.user) {
      store.dispatch(setUserFromStorage(parsed));
    }
  } catch (error) {
    console.error('Unable to restore auth session', error);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
