import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import ReactTable from '@/components/reactTable'

const ModalViewTransfers = ({setOpen, data}) => {

  const {dataTransfers, onBulkForm, fnGetDataDetail} = data;

  const fnViewTransfers = (item)=>{
    item.noCtaOrigin = item.invStore?item.invStore.idCtaInventory:''
    item.noCtaAssign = item.invAssign?item.invAssign.idCtaInventory:''

    onBulkForm(item);
    fnGetDataDetail(item.id, item.reintType);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.documentId"),
        dataField: "documentId",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "store",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.destination"),
        dataField: "destination",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("page.transfersToStores.table.column.noPhysical"),
        dataField: "noPhysical",
        headerStyle: {width: "15%"}
      }
    ],
    data: dataTransfers,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewTransfers,
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

export default ModalViewTransfers