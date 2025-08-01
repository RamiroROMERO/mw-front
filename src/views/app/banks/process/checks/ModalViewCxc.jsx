import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

export const ModalViewCxc = (props) => {
  const { data, setOpen } = props;
  const { dataCxc } = data;

  const [table, setTable] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.customer"), dataField: "customer", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.valuePayable"), dataField: "value", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '20%' } },
    ],
    data: dataCxc || [],
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
