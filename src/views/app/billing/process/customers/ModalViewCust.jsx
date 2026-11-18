import { useMemo } from "react";
import { IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";

// Buscar (revisión de pantalla #5, Fase 4): los clientes se piden por páginas de 50 con búsqueda en el servidor (RTN, nombre, teléfono o departamento), como el Catálogo de productos. La tabla, la
// búsqueda incremental y la paginación son el modal compartido `@Components/modalSearch`; aquí solo se configura.
const CUSTOMERS_URL = 'billing/settings/customers';
const mapCustomer = (item) => ({ ...item, typeCustomer: item.customerTypeData ? item.customerTypeData.name : '' });

const ModalViewCust = (props) => {
  const { data, setOpen } = props;
  const { fnViewItem } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textType = IntlMessages("page.customers.table.typeCustomer");
  const textDni = IntlMessages("page.customers.table.dni");
  const textName = IntlMessages("page.customers.table.name");
  const textPhone = IntlMessages("page.customers.table.phone");
  const textStatus = IntlMessages("page.customers.table.status");
  const textDepto = IntlMessages("select.department");

  const columns = useMemo(() => [
    {
      text: textType, dataField: "typeCustomer", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
    },
    { text: textDni, dataField: "rtn", headerStyle: { 'width': '20%' } },
    { text: textName, dataField: "nomcli", headerStyle: { 'width': '25%' } },
    {
      text: textPhone, dataField: "tel", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
    },
    {
      text: textDepto, dataField: "deptoName", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
    },
    { text: textStatus, dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } }
  ], [textType, textDni, textName, textPhone, textDepto, textStatus]);

  const config = useMemo(() => ({
    url: CUSTOMERS_URL, columns, onSelect: fnViewItem, mapRow: mapCustomer
  }), [columns, fnViewItem]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalViewCust;
