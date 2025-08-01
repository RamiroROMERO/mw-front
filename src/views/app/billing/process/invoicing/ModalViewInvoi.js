import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";
import { formatDate } from "@Helpers/Utils";

const ModalViewInvoi = (props) => {
  const { data, setOpen } = props;
  const { dataInvoicing } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.invoicing.table.title"),
    columns: [
      {
        text: IntlMessages("page.invoicing.table.date"), dataField: "date", headerStyle: { 'width': '15%' },
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.invoicing.table.number"), dataField: "documentId", headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("page.invoicing.table.invoice"), dataField: "numcai", headerStyle: { 'width': '18%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      { text: IntlMessages("page.invoicing.table.customer"), dataField: "customerName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.invoicing.table.value"), dataField: "value", headerStyle: { width: '10%' }, style: { textAlign: 'right' } },
      {
        text: IntlMessages("page.invoicing.table.doc"), dataField: "documentCode", headerStyle: { 'width': '5%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } }
    ],
    data: dataInvoicing,
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

export default ModalViewInvoi;