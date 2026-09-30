import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewTransferAffiliate = (props) => {
  const { data, setOpen } = props;
  const { dataList, fnViewTransfer } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.variousDeposits.input.description"), dataField: "description", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("table.column.reference"), dataField: "referenceIn", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.value"), dataField: "value", headerStyle: { 'width': '20%' } },
    ],
    data: dataList || [],
    actions: [{
      color: 'info',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewTransfer
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
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
