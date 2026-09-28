import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalAccountPayable = ({ data, setOpen }) => {
  const { pendingCxp, fnApplyCxp } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { width: '15%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { width: '30%' } },
      { text: IntlMessages("table.column.nInvoice"), dataField: "documentCode", headerStyle: { width: '25%' } },
      { text: IntlMessages("table.column.balance"), dataField: "balance", headerStyle: { width: '20%' } }
    ],
    actions: [{
      color: 'primary',
      icon: 'check-lg',
      toolTip: 'button.accept',
      onClick: fnApplyCxp
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
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}
