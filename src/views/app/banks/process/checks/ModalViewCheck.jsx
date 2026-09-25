import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewCheck = (props) => {
  const { data, setOpen } = props;
  const { dataChecks, fnViewCheck } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.numCheck"), dataField: "checkNumber", headerStyle: { 'width': '10%' } },
      {
        text: IntlMessages("table.column.bank"), dataField: "bankCode", headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("table.column.beneficiary"), dataField: "providerName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.value"), dataField: "value", headerStyle: { 'width': '10%' } },
    ],
    data: dataChecks || [],
    actions: [{
      color: 'info',
      icon: 'view',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewCheck
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

