import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { InputField } from "@/components/inputFields";
import ReactTable from "@/components/reactTable";

const ModalViewDetail = (props) => {
  const { data, setOpen } = props;
  const { dataProducts, currentItem } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.rawMaterial.modal.detail.table.title"),
    columns: [
      { text: IntlMessages("page.rawMaterial.table.date"), dataField: "dateIn", headerStyle: { 'width': '50%' } },
      { text: IntlMessages("page.rawMaterial.table.qtyIn"), dataField: "qtyIn", headerStyle: { 'width': '25%' }, align: 'right', headerAlign: 'right' },
      { text: IntlMessages("page.rawMaterial.table.qtyOut"), dataField: "qtyOut", headerStyle: { 'width': '25%' }, align: 'right', headerAlign: 'right' }
    ],
    data: dataProducts,
    actions: []
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={currentItem.prodProduct.name}
              name="name"
              disabled
              type="text"
              label="page.rawMaterial.input.nameProduct"
            />
          </Colxx>
        </Row>
        <Row className="mb-3">
          <Colxx xxs="12">
            <ReactTable
              {...table}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="7" xs="9"> </Colxx>
          <Colxx xxs="5" xs="3">
            <InputField
              value={currentItem.qtyStock}
              name="qtyStock"
              disabled
              type="text"
              label="page.rawMaterial.table.stock"
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

export default ModalViewDetail;