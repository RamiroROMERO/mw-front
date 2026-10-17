import { useMemo } from "react";
import { IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";

// Buscar (SPEC v2-18-sr): el catálogo se pide por páginas de 50 con búsqueda en el servidor (código, nombre o descripción).
// La tabla, la búsqueda incremental y la paginación son el modal compartido `@Components/modalSearch`; aquí solo se configura.
const PRODUCTS_URL = 'inventory/settings/products';
const mapProduct = (item) => ({ ...item, presentation: item.submission });

const ModalViewProd = (props) => {
  const { data, setOpen } = props;
  const { fnSelectItem } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textCode = IntlMessages("page.productsCatalog.table.code");
  const textName = IntlMessages("page.productsCatalog.table.name");
  const textPresentation = IntlMessages("page.productsCatalog.table.presentation");
  const textInputUnit = IntlMessages("page.productsCatalog.table.inputUnit");

  const columns = useMemo(() => [
    { text: textCode, dataField: "code", headerStyle: { 'width': '20%' } },
    { text: textName, dataField: "name", headerStyle: { 'width': '30%' } },
    {
      text: textPresentation, dataField: "presentation", headerStyle: { 'width': '15%' },
      classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
    },
    {
      text: textInputUnit, dataField: "inputUnit", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
    }
  ], [textCode, textName, textPresentation, textInputUnit]);

  const config = useMemo(() => ({
    url: PRODUCTS_URL, columns, onSelect: fnSelectItem, mapRow: mapProduct
  }), [columns, fnSelectItem]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalViewProd;
