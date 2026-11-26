import { useMemo } from "react";
import { formatDate, formatNumber, IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";
import { EVENTS_PATH } from "./posHospitalRules";

// Eventos abiertos para facturar en el POS (SPEC v2-154-sr): por páginas en el servidor, con búsqueda por número de evento o por nombre o RTN del paciente. El servidor solo
// lista los eventos abiertos y sin factura vigente.
const ModalHospitalEvents = (props) => {
  const { data, setOpen } = props;
  const { fnSelect } = data;

  const textEvent = IntlMessages("page.pointSales.hospital.table.event");
  const textDate = IntlMessages("page.invoicing.table.date");
  const textPatient = IntlMessages("page.pointSales.hospital.table.patient");
  const textInsurance = IntlMessages("page.pointSales.hospital.table.insurance");
  const textLines = IntlMessages("page.pointSales.hospital.table.lines");
  const textValue = IntlMessages("page.invoicing.table.value");

  const columns = useMemo(() => [
    { text: textEvent, dataField: "id", headerStyle: { width: '9%' } },
    { text: textDate, dataField: "date", headerStyle: { width: '12%' }, cell: ({ row }) => formatDate(row.original.date) },
    { text: textPatient, dataField: "patientName", headerStyle: { width: '31%' } },
    { text: textInsurance, dataField: "insuranceName", headerStyle: { width: '24%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' },
    { text: textLines, dataField: "lines", headerStyle: { width: '8%' }, style: { textAlign: 'right' }, classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell' },
    { text: textValue, dataField: "total", headerStyle: { width: '16%' }, style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.total) }
  ], [textEvent, textDate, textPatient, textInsurance, textLines, textValue]);

  const config = useMemo(() => ({
    url: EVENTS_PATH, columns, onSelect: fnSelect, pageSize: 50, closeOnSelect: true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [columns]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalHospitalEvents;
