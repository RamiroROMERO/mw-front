import { useMemo } from "react";
import { formatDate, IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";
import { HONORARIUM_EVENTS_PATH } from "./posHonorariumRules";

// Eventos para registrar el recibo de honorarios (SPEC v2-156-sr): cualquier estado, por páginas, con búsqueda por número de evento o por nombre o RTN del paciente.
const ModalHonorariumEvents = (props) => {
  const { data, setOpen } = props;
  const { fnSelect } = data;

  const textEvent = IntlMessages("page.pointSales.hospital.table.event");
  const textDate = IntlMessages("page.invoicing.table.date");
  const textPatient = IntlMessages("page.pointSales.hospital.table.patient");

  const columns = useMemo(() => [
    { text: textEvent, dataField: "id", headerStyle: { width: '15%' } },
    { text: textDate, dataField: "date", headerStyle: { width: '20%' }, cell: ({ row }) => formatDate(row.original.date) },
    { text: textPatient, dataField: "patientName", headerStyle: { width: '65%' } }
  ], [textEvent, textDate, textPatient]);

  const config = useMemo(() => ({
    url: HONORARIUM_EVENTS_PATH, columns, onSelect: fnSelect, pageSize: 50, closeOnSelect: true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [columns]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalHonorariumEvents;
