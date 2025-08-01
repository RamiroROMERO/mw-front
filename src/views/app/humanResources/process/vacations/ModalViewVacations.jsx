import React, { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatDate } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable'

const ModalViewVacations = ({data, setOpen}) => {
  const {dataVacations, setBulkForm, setFilePath} = data;

  const fnViewVacation = (item)=>{
    setBulkForm(item);
    setFilePath(item.filePath);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.vacations.modal.viewVacation.title"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "10%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("page.permission.modal.table.column.time"),
        dataField: "time",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("page.permission.modal.table.column.authorizedBy"),
        dataField: "authorizedBy",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataVacations,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewVacation
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

export default ModalViewVacations