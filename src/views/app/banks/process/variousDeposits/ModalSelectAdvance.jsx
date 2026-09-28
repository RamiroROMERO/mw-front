import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

// Picker de Anticipos a Proveedores con saldo disponible (cont_cxp_advance, sin filtrar por
// proveedor — igual criterio que Partidas Diarias/AdvanceService.findAllPending). Aplica el
// saldo COMPLETO por defecto; el monto queda editable en el encabezado tras seleccionarlo.
export const ModalSelectAdvance = (props) => {
  const { data, setOpen } = props;
  const { pendingAdvances, fnApplyAdvance } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("page.variousDeposits.input.description"), dataField: "description", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.balance"), dataField: "balance", headerStyle: { 'width': '20%' } },
    ],
    data: pendingAdvances || [],
    actions: [{
      color: 'primary',
      icon: 'check-lg',
      toolTip: 'button.accept',
      onClick: fnApplyAdvance
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={pendingAdvances || []} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
