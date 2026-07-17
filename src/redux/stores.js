import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { thunk } from 'redux-thunk';
import reducers from './reducers';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware();
const module = window;

const middlewares = [sagaMiddleware];

let storeInstance;

export function configureStore(initialState) {
  const store = createStore(
    reducers,
    initialState,
    compose(applyMiddleware(...middlewares, thunk))
  );

  sagaMiddleware.run(sagas);
  if (module && module.hot) {
    module.hot.accept('./reducers', () => {
      // eslint-disable-next-line global-require
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  storeInstance = store;
  return store;
}

// Permite despachar acciones desde fuera del árbol de React (ej. src/helpers/core.js
// al detectar un token expirado), donde no hay acceso a useDispatch/useSelector.
export function getStore() {
  return storeInstance;
}
