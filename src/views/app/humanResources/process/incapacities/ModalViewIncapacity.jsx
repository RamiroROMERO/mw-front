import React, {useState} from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatDate } from '@Helpers/Utils'
import ReactTable from '@Components/reactTable';

const ModalViewIncapacity = ({data, setOpen}) => {
  const {dataIncapacities, setBulkForm} = data;

  const fnViewIncapacity = (item)=>{
    setBulkForm(item);
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
        text: IntlMessages("table.column.reason"),
        dataField: "reason",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.startDisability"),
        dataField: "startDisability",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.endDisability"),
        dataField: "endDisability",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataIncapacities,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewIncapacity
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

export default ModalViewIncapacity