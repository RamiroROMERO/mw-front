import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages, formatDate } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import ReactTable from '@Components/reactTable'

const ModalViewProofWork = ({data, setOpen}) => {
  const {dataProofWork, setBulkForm, setFilePath} = data;

  const fnViewProofWork = (item)=>{
    setBulkForm(item);
    setFilePath(item.filePath);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.proofWork.modal.viewProofWork.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "creationDate",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.creationDate));
        }
      },
      {
        text: IntlMessages("table.column.name"),
        dataField: "employee",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("table.column.dni"),
        dataField: "dni",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataProofWork,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewProofWork
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
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalViewProofWork