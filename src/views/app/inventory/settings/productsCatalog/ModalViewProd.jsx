import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";


const ModalViewProd = (props) => {
  const { data, setOpen } = props;
  const { dataProducts, fnSelectItem } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.productsCatalog.table.title"),
    columns: [
      { text: IntlMessages("page.productsCatalog.table.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.productsCatalog.table.name"), dataField: "name", headerStyle: { 'width': '30%' } },
      {
        text: IntlMessages("page.productsCatalog.table.presentation"), dataField: "presentation", headerStyle: { 'width': '15%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("page.productsCatalog.table.inputUnit"), dataField: "inputUnit", headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      }
    ],
    data: dataProducts,
    actions: [{
      color: 'info',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnSelectItem
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable
              {...table}
            />
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

export default ModalViewProd;