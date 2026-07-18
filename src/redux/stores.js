import { configureStore as createReduxStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import reducers from './reducers';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware();

let storeInstance;

export function configureStore(initialState) {
  const store = createReduxStore({
    reducer: reducers,
    preloadedState: initialState,
    // RTK's getDefaultMiddleware() already includes redux-thunk (used by
    // src/redux/generalData/actions.js) — only redux-saga needs adding.
    // serializableCheck/immutableCheck disabled: several action payloads
    // carry a history() navigate function (see auth actions), which RTK's
    // default checks would otherwise warn about on every dispatch.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(sagas);
  storeInstance = store;
  return store;
}

// Permite despachar acciones desde fuera del árbol de React (ej. src/helpers/core.js
// al detectar un token expirado), donde no hay acceso a useDispatch/useSelector.
export function getStore() {
  return storeInstance;
}
