import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, validFloat } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

// Picker de CxP pendientes del proveedor del cheque (bco_chequeseitem.sc2 — "Facturas
// Pendientes"). Aplica el saldo COMPLETO de la factura elegida — pago parcial con monto
// editable queda diferido (ver alcance acordado para esta pantalla).
export const ModalViewCxp = (props) => {
  const { data, setOpen } = props;
  const { pendingCxp, fnApplyCxpPayment } = data;

  const fnApply = (row) => {
    fnApplyCxpPayment(row, validFloat(row.balance));
  }

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.nInvoice"), dataField: "documentCode", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.balance"), dataField: "balance", headerStyle: { 'width': '15%' } },
    ],
    data: pendingCxp || [],
    actions: [{
      color: 'primary',
      icon: 'check-lg',
      toolTip: 'button.accept',
      onClick: fnApply
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={pendingCxp || []} />
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
