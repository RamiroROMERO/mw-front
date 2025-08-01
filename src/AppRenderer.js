import React from 'react'
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import AppLocale from 'lang';
import App from './App3';

const Main = () => {

  const userLocale =
    navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;

  const currentAppLocale = AppLocale[userLocale.split('-')[0]];

  return (
    <React.StrictMode>
      <IntlProvider
        locale={currentAppLocale.locale}
        messages={currentAppLocale.messages}
      >
        <App />
      </IntlProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(<Main />, document.getElementById('root'));