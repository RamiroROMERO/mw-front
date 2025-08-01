import { Colxx } from "@/components/common/CustomBootstrap";
import { IntlMessages } from "@/helpers/Utils";
import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import ReactTable from "@/components/reactTable";

const ModalConcepts = (props) => {
  const { data, setOpen } = props;

  const [table, setTable] = useState({
    title: "",
    columns: [
      { text: IntlMessages("page.pointSales.modal.concepts.table.code"), dataField: "code", headerStyle: { 'width': "15%" } },
      { text: IntlMessages("page.pointSales.modal.concepts.table.name"), dataField: "name", headerStyle: { 'width': "70%" } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "15%" }, align: "right" }
    ],
    data: [],
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
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalConcepts;