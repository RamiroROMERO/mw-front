import { useMemo } from "react";
import { IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";
import { ADVANCE_PATIENTS_PATH } from "./posAdvanceRules";

// Pacientes para registrar o consultar adelantos (SPEC v2-155-sr): por páginas en el servidor, con búsqueda por nombre o RTN; informa cuántos adelantos pendientes tiene cada uno.
const ModalAdvancePatients = (props) => {
  const { data, setOpen } = props;
  const { fnSelect } = data;

  const textName = IntlMessages("page.pointSales.hospital.table.patient");
  const textDni = IntlMessages("page.pointSales.advance.table.dni");
  const textPending = IntlMessages("page.pointSales.advance.table.pending");

  const columns = useMemo(() => [
    { text: textName, dataField: "name", headerStyle: { width: '55%' } },
    { text: textDni, dataField: "dni", headerStyle: { width: '25%' }, classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell' },
    { text: textPending, dataField: "pendingCount", headerStyle: { width: '20%' }, style: { textAlign: 'right' } }
  ], [textName, textDni, textPending]);

  const config = useMemo(() => ({
    url: ADVANCE_PATIENTS_PATH, columns, onSelect: fnSelect, pageSize: 50, closeOnSelect: true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [columns]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalAdvancePatients;
