import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewDebCredNote = (props) => {
  const { data, setOpen } = props;
  const { dataList, fnViewNote } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.reference"), dataField: "referenceCode", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.debCredNotes.input.reason"), dataField: "description", headerStyle: { 'width': '40%' } },
      { text: IntlMessages("table.column.value"), dataField: "value", headerStyle: { 'width': '20%' } },
    ],
    data: dataList || [],
    actions: [{
      color: 'info',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewNote
    }]
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
  )
}
