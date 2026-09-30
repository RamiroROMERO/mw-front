import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewRequest = ({ data, setOpen }) => {
  const { dataList, fnViewRequest } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { width: '15%' } },
      { text: IntlMessages("table.column.beneficiary"), dataField: "providerName", headerStyle: { width: '35%' } },
      { text: IntlMessages("table.column.value"), dataField: "value", headerStyle: { width: '15%' } },
      { text: IntlMessages("page.checkRequest.input.requestedBy"), dataField: "requestedBy", headerStyle: { width: '20%' } },
      { text: IntlMessages("page.checkRequest.title.status"), dataField: "status", headerStyle: { width: '15%' } }
    ],
    actions: [{
      color: 'warning',
      icon: 'eye',
      toolTip: 'button.edit',
      onClick: fnViewRequest
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={dataList || []} />
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
