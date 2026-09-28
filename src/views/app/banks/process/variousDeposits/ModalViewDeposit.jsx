import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewDeposit = (props) => {
  const { data, setOpen } = props;
  const { dataDeposits, fnViewDeposit } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.reference"), dataField: "referenceCode", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.customer"), dataField: "customerName", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.variousDeposits.input.description"), dataField: "description", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.value"), dataField: "value", headerStyle: { 'width': '15%' } },
    ],
    data: dataDeposits || [],
    actions: [{
      color: 'info',
      icon: 'view',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewDeposit
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
