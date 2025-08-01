import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

const ModalBillToPay = (props) => {
  const { data, setOpen } = props;
  const { listCxp } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.retentionReceipt.modal.billToPay.table.title"),
    columns: [
      {
        text: IntlMessages("page.invoicing.modal.products.table.code"), dataField: "code", headerStyle: { 'width': '15%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("table.column.provider"), dataField: "provider", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.value"), dataField: "total", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } }
    ],
    data: listCxp,
    actions: []
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
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalBillToPay;