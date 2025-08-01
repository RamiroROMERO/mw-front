import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";
import { formatNumber } from "@Helpers/Utils";

export const ModalViewRequest = (props) => {
  const { data, setOpen } = props;
  const { listRequest, fnViewRequest } = data;

  const [table, setTable] = useState({
    columns: [
      { text: IntlMessages("table.column.code"), dataField: "code", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("table.column.beneficiary"), dataField: "beneficiary", headerStyle: { 'width': '25%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("table.column.value"), dataField: "total", headerStyle: { 'width': '20%' },
        cell: ({ row }) => { return formatNumber(row.original.total, "L. ", 2) }
      },
      // { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' } }

    ],
    data: listRequest || [],
    actions: [
      {
        color: 'warning',
        icon: 'view',
        toolTip: 'button.edit',
        onClick: fnViewRequest,
        title: IntlMessages('button.edit')
      },
      // { color: 'danger',
      //   icon: 'trash',
      //   toolTip: 'button.delete',
      //   onClick: fnDeleteItem,
      //   showInMenu: true,
      //   title: IntlMessages('button.delete') }
    ],
    options: {
      enabledActionButtons: true
    }
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

