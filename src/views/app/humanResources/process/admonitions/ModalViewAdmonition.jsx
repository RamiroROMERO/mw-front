import React, { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { formatDate, IntlMessages, validInt } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

const ModalViewAdmonition = ({data,setOpen}) => {
  const {dataAdmonitions, setBulkForm, setFilePath, setShowDocto1, setShowDocto2, setShowDocto3, setShowOffense, setShowReportM,listOffenses, setFilterFaults} = data;

  const fnViewAdmonitions = (item)=>{
    const filterOffenses = listOffenses.filter((item2)=>{
      return item2.faulClassificationId === validInt(item.offenseTypeId)
    });
    item.appointmentDate = item.appointmentDate?item.appointmentDate.substring(0,19):'1900-01-01'
    setFilterFaults(filterOffenses);
    setBulkForm(item);
    setFilePath(item.filePath);
    if(validInt(item.documentTypeId)===1){
      setShowDocto1("block");
      setShowDocto2("block");
      setShowDocto3("none");
      setShowOffense("block");
      setShowReportM("none");
    }else if(validInt(item.documentTypeId)===2){
      setShowDocto1("none");
      setShowDocto2("block");
      setShowDocto3("none");
      setShowOffense("block");
      setShowReportM("block");
    }else if(validInt(item.documentTypeId)===3){
      setShowDocto1("none");
      setShowDocto2("none");
      setShowDocto3("block");
      setShowOffense("none");
      setShowReportM("block");
    }else{
      setShowDocto1("none");
      setShowDocto2("none");
      setShowDocto3("none");
      setShowOffense("none");
      setShowReportM("none");
    }
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.admonitions.modal.viewAdmonition.title"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "50%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "offenseDate",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.offenseDate));
        }
      },
      {
        text: IntlMessages("table.column.type"),
        dataField: "type",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataAdmonitions,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewAdmonitions
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

export default ModalViewAdmonition