import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from './redux/stores';
import './assets/css/bootstrap/bootstrap.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/css/style.css';

import App from './App';
import { getCurrentColor } from './helpers/Utils';

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

import(`./assets/sass/themes/gogo.${currentColor}.scss`).then(() => {
  root.render(
    // <React.StrictMode>
    <Provider store={store}>
      {/* <h1>Testing</h1> */}
      <App />
    </Provider>
    // </React.StrictMode>
  );
});

