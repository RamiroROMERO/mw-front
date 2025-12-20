import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { formatNumber, IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

const ModalSeekQuotes = (props) => {
  const { data, setOpen } = props;
  const { dataQuotes, fnViewItem } = data;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("input.number"), dataField: "id", headerStyle: { 'width': '15%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("input.date"), dataField: "date", headerStyle: { 'width': '15%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("input.name"), dataField: "customerName", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("input.total"), dataField: "total", headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', cell: ({ row }) => { return formatNumber(row.original.total, "L. ", 2) }
      }
    ],
    data: dataQuotes,
    actions: [{
      color: 'primary',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewItem
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
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSeekQuotes;