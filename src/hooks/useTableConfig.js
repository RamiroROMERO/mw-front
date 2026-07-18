import { useMemo } from 'react';

// Reemplaza el patrón useTableConf.js repetido en cada submódulo de
// settings/ (mismo esqueleto title/columns/data/actions/options, solo
// cambiaban las columnas y acciones). El memo solo depende de `data` para
// preservar el comportamiento exacto de los hooks originales, que no
// re-evaluaban title/columns/actions entre renders.
export const useTableConfig = ({ title, columns, data, actions, options }) => {
  const tableInfo = useMemo(() => ({
    title,
    columns,
    data,
    ...(actions ? { actions } : {}),
    ...(options ? { options } : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data]);

  return { tableInfo };
};
