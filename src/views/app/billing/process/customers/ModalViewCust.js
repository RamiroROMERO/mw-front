import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable"

const ModalViewCust = (props) => {
  const { data, setOpen } = props;
  const { dataCustomers, fnViewItem } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.customers.table.title"),
    columns: [
      {
        text: IntlMessages("page.customers.table.typeCustomer"), dataField: "typeCustomer", headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      { text: IntlMessages("page.customers.table.dni"), dataField: "rtn", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.customers.table.name"), dataField: "nomcli", headerStyle: { 'width': '25%' } },
      {
        text: IntlMessages("page.customers.table.phone"), dataField: "tel", headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      { text: IntlMessages("page.customers.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } },
      // { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } }
    ],
    data: dataCustomers,
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

export default ModalViewCust;