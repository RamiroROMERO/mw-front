import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, validFloat } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

// Picker de CxC pendientes del cliente elegido dentro de ModalCxc. Aplica el saldo COMPLETO
// de la factura elegida — mismo criterio que ModalViewCxp del lado de CxP.
export const ModalViewCxc = (props) => {
  const { data, setOpen } = props;
  const { pendingCxc, fnApplyCxcPayment } = data;

  const fnApply = (row) => {
    fnApplyCxcPayment(row, validFloat(row.balance));
  }

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.nInvoice"), dataField: "documentCode", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.customer"), dataField: "customerName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.balance"), dataField: "balance", headerStyle: { 'width': '15%' } },
    ],
    data: pendingCxc || [],
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
            <ReactTable {...table} data={pendingCxc || []} />
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
