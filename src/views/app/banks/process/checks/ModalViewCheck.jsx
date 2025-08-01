import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

export const ModalViewCheck = (props) => {
  const { data, setOpen } = props;
  const { dataChecks, fnViewCheck } = data;

  const [table, setTable] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.numCheck"), dataField: "code", headerStyle: { 'width': '10%' } },
      {
        text: IntlMessages("table.column.bank"), dataField: "bank", headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("table.column.beneficiary"), dataField: "proveedorId", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.value"), dataField: "total", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.account"), dataField: "accountId", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("page.checks.modalviewCheck.table.column.item"), dataField: "item", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.referency"), dataField: "items", headerStyle: { 'width': '10%' } },
      // { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '20%' } }
    ],
    data: dataChecks || [],
    actions: [{
      color: 'info',
      icon: 'view',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewCheck
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

