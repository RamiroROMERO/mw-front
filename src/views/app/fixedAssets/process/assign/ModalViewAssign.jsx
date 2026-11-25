import { useMemo } from 'react';
import { IntlMessages, formatDate } from '@Helpers/Utils';
import { ModalSearchContent } from '@Components/modalSearch';

// Buscar asignación: páginas de 50 con búsqueda en el servidor (activo, responsable o área). La tabla, la búsqueda y la paginación son el modal compartido
// `@Components/modalSearch`; aquí solo se configura.
const ASSIGN_URL = 'fixedAssets/process/assign/search';

const mapRow = (item) => ({ ...item, dateText: formatDate(item.date), stateText: item.dateEnd && String(item.dateEnd).slice(0, 10) !== '1900-01-01' ? '✓' : '' });

export const ModalViewAssign = ({ data, setOpen }) => {
  const { fnViewAssign } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textDate = IntlMessages('table.column.date');
  const textAsset = IntlMessages('page.fixedAssets.title.asset');
  const textResponsible = IntlMessages('page.fixedAssets.select.responsible');
  const textArea = IntlMessages('page.fixedAssets.select.area');
  const textEnd = IntlMessages('page.fixedAssets.input.dateEnd');

  const columns = useMemo(() => [
    { text: textDate, dataField: 'dateText', headerStyle: { width: '13%' } },
    { text: textAsset, dataField: 'assetName', headerStyle: { width: '32%' } },
    { text: textResponsible, dataField: 'responsibleName', headerStyle: { width: '22%' } },
    { text: textArea, dataField: 'areaName', headerStyle: { width: '23%' } },
    { text: textEnd, dataField: 'stateText', headerStyle: { width: '10%' } }
  ], [textDate, textAsset, textResponsible, textArea, textEnd]);

  const config = useMemo(() => ({ url: ASSIGN_URL, columns, onSelect: fnViewAssign, mapRow }), [columns, fnViewAssign]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};
