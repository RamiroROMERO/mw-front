import React, { useState } from 'react'
import { IntlMessages, formatDate, validInt } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';

const ModalViewAccidents = ({data,setOpen}) => {
  const {dataAccidents, setBulkForm, setFilePath, setShowInputs} = data;

  const fnViewAccidents = (item)=>{
    setBulkForm(item);
    setFilePath(item.filePath);
    if(validInt(item.typeId)===2){
      setShowInputs("block");
    }else{
      setShowInputs("none");
    }
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.accidents.modal.viewAccidents.title"),
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
        text: IntlMessages("table.column.type"),
        dataField: "type",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: {width: "35%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataAccidents,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewAccidents
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

export default ModalViewAccidents