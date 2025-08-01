import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

export const ModalAccountPayable = (props) => {
  const { data, setOpen } = props;
  const { listCxp } = data;

  const [table, setTable] = useState({
    title: "",
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("table.column.provider"), dataField: "proveedor", headerStyle: { 'width': '25%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("table.column.invoice"), dataField: "descrip", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.value"), dataField: "total", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' } }
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
        <Button color="primary">
          <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
