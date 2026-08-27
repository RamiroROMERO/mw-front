import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from './redux/stores';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/css/style.css';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { getCurrentColor, registerInitialTheme } from './helpers/Utils';

if (!String.prototype.toProperCase) {
  String.prototype.toProperCase = function () {
    const str = this.valueOf();
    const properString = str.split(' ').reduce((acc, curr) => {
      acc += curr.charAt(0).toUpperCase() + curr.slice(1).toLowerCase() + " ";
      return acc;
    }, "");
    return properString.trim();
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const currentColor = getCurrentColor();
const store = configureStore({});

const headChildrenBeforeTheme = new Set(document.head.children);
import(`./assets/sass/themes/gogo.${currentColor}.scss`).then(() => {
  registerInitialTheme(currentColor, headChildrenBeforeTheme);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <App />
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
});

