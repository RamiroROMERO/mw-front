import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

const ModalProducts = (props) => {
  const { data, setOpen } = props;
  const { listProducts } = data;

  const [table, setTable] = useState({
    // title: IntlMessages("page.invoicing.modal.products.table.title"),
    title: '',
    columns: [
      {
        text: IntlMessages("page.invoicing.modal.products.table.code"), dataField: "productCode", headerStyle: { 'width': '15%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("page.invoicing.modal.products.table.name"), dataField: "productName", headerStyle: { 'width': '25%' } },
      {
        text: IntlMessages("page.invoicing.modal.products.table.unit"), dataField: "unitProd", headerStyle: { 'width': '10%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("page.invoicing.modal.products.table.min"), dataField: "min", headerStyle: { 'width': '10%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', style: { textAlign: 'right' }
      },
      {
        text: IntlMessages("page.invoicing.modal.products.table.med"), dataField: "med", headerStyle: { 'width': '10%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', style: { textAlign: 'right' }
      },
      { text: IntlMessages("page.invoicing.modal.products.table.max"), dataField: "max", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } },
      { text: IntlMessages("page.invoicing.modal.products.table.stock"), dataField: "stock", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } }
    ],
    data: listProducts,
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

export default ModalProducts;