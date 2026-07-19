import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalExpenses = (props) => {
  const { data, setOpen } = props;
  const { dataExpenses } = data;

  const [table, setTable] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { 'width': '55%' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '20%' } }
    ],
    data: dataExpenses || [],
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
