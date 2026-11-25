import { useMemo } from 'react';
import { IntlMessages, formatDate } from '@Helpers/Utils';
import { ModalSearchContent } from '@Components/modalSearch';

// Buscar activo: páginas de 50 con búsqueda en el servidor (código, nombre o series). La tabla, la búsqueda y la paginación son el modal compartido
// `@Components/modalSearch`; aquí solo se configura.
const REGISTER_URL = 'fixedAssets/process/fixedAssets/search';

const mapRow = (item) => ({ ...item, dateText: formatDate(item.dateIn) });

export const ModalViewRegister = ({ data, setOpen }) => {
  const { fnViewRegister } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textCode = IntlMessages('page.fixedAssets.input.code');
  const textName = IntlMessages('input.name');
  const textSerial = IntlMessages('page.fixedAssets.input.serial1');
  const textDate = IntlMessages('page.fixedAssets.input.dateIn');

  const columns = useMemo(() => [
    { text: textCode, dataField: 'code', headerStyle: { width: '25%' } },
    { text: textName, dataField: 'name', headerStyle: { width: '40%' } },
    { text: textSerial, dataField: 'serial1', headerStyle: { width: '20%' } },
    { text: textDate, dataField: 'dateText', headerStyle: { width: '15%' } }
  ], [textCode, textName, textSerial, textDate]);

  const config = useMemo(() => ({ url: REGISTER_URL, columns, onSelect: fnViewRegister, mapRow }), [columns, fnViewRegister]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};
