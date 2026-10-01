// Al cargar una transferencia existente, el valor guardado (neto, con retenciones) no debe reemplazarse por el
// total de débitos del grid. `markLoaded` se llama justo antes de cargar las líneas; el efecto sobre `lines` llama
// `shouldSyncValue`, que devuelve false una sola vez (la actualización que viene de la carga) y true después.
export const createValueSync = () => {
  let loaded = false;
  return {
    markLoaded: () => { loaded = true; },
    shouldSyncValue: () => {
      if (loaded) {
        loaded = false;
        return false;
      }
      return true;
    }
  };
};
