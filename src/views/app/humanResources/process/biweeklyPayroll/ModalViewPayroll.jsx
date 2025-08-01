import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable'

const ModalViewPayroll = ({setOpen, data}) => {
  const {dataPayrolls, setBulkForm, fnViewDetailPayroll} = data;

  const fnViewDetail = (item)=>{
    fnViewDetailPayroll(item.id);
    setBulkForm(item);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.biweeklyPayroll.modal.viewPayrolls.title"),
    columns: [
      {
        text: IntlMessages("table.column.biweekly"),
        dataField: "biweekly",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.notes"),
        dataField: "notes",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataPayrolls,
    options: {
      enabledRowSelection: false,
      enabledActionButtons: true,
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewDetail
      }
    ]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table}/>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalViewPayroll