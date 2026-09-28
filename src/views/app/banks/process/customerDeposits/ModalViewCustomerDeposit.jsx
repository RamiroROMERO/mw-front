import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewCustomerDeposit = (props) => {
  const { data, setOpen } = props;
  const { dataList, fnViewDeposit } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.customerDeposits.input.depositNumber"), dataField: "depositNumber", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.variousDeposits.input.description"), dataField: "description", headerStyle: { 'width': '40%' } },
      { text: IntlMessages("table.column.value"), dataField: "value", headerStyle: { 'width': '15%' } },
    ],
    data: dataList || [],
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
