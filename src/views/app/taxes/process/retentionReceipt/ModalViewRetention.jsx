import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

const ModalViewRetention = (props) => {
  const { data, setOpen } = props;
  const { dataRetention, fnViewOrderDetail, setBulkFormIndex } = data;

  const fnViewReceipts = (itemReceipt) => {
    itemReceipt.limitDate = itemReceipt.limitDate === "1900-01-01" ? "" : itemReceipt.limitDate
    setBulkFormIndex(itemReceipt);
    fnViewOrderDetail(itemReceipt.id);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.retentionReceipt.table.title"),
    columns: [
      { Header: IntlMessages("page.retentionReceipt.table.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      {
        Header: IntlMessages("page.retentionReceipt.table.documentCode"), dataField: "numberCAI", headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("page.retentionReceipt.table.providerId"), dataField: "provider", headerStyle: { 'width': '18%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("page.retentionReceipt.table.total"), dataField: "value", headerStyle: { 'width': '5%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', style: { textAlign: 'right' }
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' } }
    ],
    data: dataRetention,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewReceipts,
      }
    ]
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

export default ModalViewRetention;