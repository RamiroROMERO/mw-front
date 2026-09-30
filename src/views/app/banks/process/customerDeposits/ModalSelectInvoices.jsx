import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

// A diferencia de ModalViewCxp/ModalViewCxc (aplican UNA factura y cierran), este picker se
// mantiene abierto tras cada "Aplicar" — el legacy (Cont_PdaCxC_Add) permite selección
// múltiple de facturas en un solo paso, y la mayoría de depósitos reales aplican 1-3
// facturas de una vez.
export const ModalSelectInvoices = (props) => {
  const { data } = props;
  const { pendingInvoices, fnApplyInvoice } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.nInvoice"), dataField: "documentCode", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.customerDeposits.table.originalValue"), dataField: "originalValue", type: 'number', headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.balance"), dataField: "balance", type: 'number', headerStyle: { 'width': '20%' } },
    ],
    data: pendingInvoices || [],
    actions: [{
      color: 'primary',
      icon: 'check-lg',
      toolTip: 'button.accept',
      onClick: fnApplyInvoice
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={pendingInvoices || []} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { props.setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
