import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import ReactTable from '@/components/reactTable'
import { formatDate } from '@Helpers/Utils'

const ModalViewMemos = ({setOpen, data}) => {
  const {dataMemos} = data;

  const fnViewMemo = ()=>{}

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.nameFor"),
        dataField: "nameFor",
        headerStyle: {width: "35%"}
      },
      {
        text: IntlMessages("table.column.nameFrom"),
        dataField: "nameFrom",
        headerStyle: {width: "35%"}
      },
      {
        text: IntlMessages("table.column.no"),
        dataField: "noMemo",
        headerStyle: {width: "15%"}
      }
    ],
    data: dataMemos,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewMemo
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

export default ModalViewMemos