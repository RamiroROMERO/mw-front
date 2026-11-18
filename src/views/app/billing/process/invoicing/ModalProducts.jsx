import { useMemo } from "react";
import { formatNumber, IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";
import { PRODUCTS_PATH } from "./invoicingRules";

// Buscar producto de Facturación (SPEC v2-71-sr): los productos se piden por páginas al servidor, con búsqueda por código, nombre o marca y la existencia del almacén
// elegido (antes se bajaba el catálogo completo del almacén y se filtraba en el navegador). La búsqueda incremental y la paginación son el modal compartido
// `@Components/modalSearch`; aquí solo se configura. Una fila por unidad de venta (distribución activa); los precios ya vienen sin el ISV incluido.
const ModalProducts = (props) => {
  const { data, setOpen } = props;
  const { storeId, fnSelect } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textCode = IntlMessages("page.invoicing.modal.products.table.code");
  const textName = IntlMessages("page.invoicing.modal.products.table.name");
  const textUnit = IntlMessages("page.invoicing.modal.products.table.unit");
  const textMin = IntlMessages("page.invoicing.modal.products.table.min");
  const textMed = IntlMessages("page.invoicing.modal.products.table.med");
  const textMax = IntlMessages("page.invoicing.modal.products.table.max");
  const textStock = IntlMessages("page.invoicing.modal.products.table.stock");

  const columns = useMemo(() => [
    { text: textCode, dataField: "code", headerStyle: { 'width': '15%' }, classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell' },
    { text: textName, dataField: "name", headerStyle: { 'width': '27%' } },
    { text: textUnit, dataField: "unitName", headerStyle: { 'width': '10%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' },
    {
      text: textMin, dataField: "minPrice", headerStyle: { 'width': '10%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', style: { textAlign: 'right' },
      cell: ({ row }) => formatNumber(row.original.minPrice)
    },
    {
      text: textMed, dataField: "midPrice", headerStyle: { 'width': '10%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', style: { textAlign: 'right' },
      cell: ({ row }) => formatNumber(row.original.midPrice)
    },
    { text: textMax, dataField: "maxPrice", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.maxPrice) },
    { text: textStock, dataField: "stock", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' }, cell: ({ row }) => (row.original.kind === 2 ? '' : formatNumber(row.original.stock)) }
  ], [textCode, textName, textUnit, textMin, textMed, textMax, textStock]);

  const config = useMemo(() => ({
    url: PRODUCTS_PATH, columns, onSelect: fnSelect, extraParams: { storeId }, pageSize: 50
  }), [columns, fnSelect, storeId]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalProducts;
