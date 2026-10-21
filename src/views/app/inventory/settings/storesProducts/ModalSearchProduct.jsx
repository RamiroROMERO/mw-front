import { useMemo } from 'react'
import { IntlMessages } from '@Helpers/Utils'
import { ModalSearchContent } from '@Components/modalSearch'

// Búsqueda de producto con F1 (inv_prod_seek.sc2 del legacy): el catálogo por páginas de 50 con búsqueda en el servidor (código,
// nombre o descripción), solo productos habilitados. La tabla, la búsqueda incremental y la paginación son el modal compartido.
const PRODUCTS_URL = 'inventory/settings/products';
const EXTRA_PARAMS = { isDisabled: 0 };

const ModalSearchProduct = ({ data, setOpen }) => {
  const { fnSelectItem } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textCode = IntlMessages('page.productsCatalog.table.code');
  const textName = IntlMessages('page.productsCatalog.table.name');
  const textSelect = IntlMessages('page.storesProducts.button.selectProduct');

  const columns = useMemo(() => [
    { text: textCode, dataField: 'code', headerStyle: { width: '30%' } },
    { text: textName, dataField: 'name', headerStyle: { width: '70%' } }
  ], [textCode, textName]);

  const config = useMemo(() => ({
    url: PRODUCTS_URL, columns, onSelect: fnSelectItem, extraParams: EXTRA_PARAMS, closeOnSelect: true, selectIcon: 'check', selectToolTip: textSelect
  }), [columns, fnSelectItem, textSelect]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSearchProduct
