import React, { useState } from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@/components/reactTable'

const ModalViewPurchases = ({setOpen, data}) => {
  const {dataPurchases, setBulkForm, fnGetDataDetail} = data;

  const fnViewPurchase = (item) =>{
    setBulkForm(item);
    fnGetDataDetail(item.id);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("page.purchases.modal.viewPurchases.table.documentId"),
        dataField: "documentId",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("page.purchases.modal.viewPurchases.table.date"),
        dataField: "dateIn",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.purchases.modal.viewPurchases.table.numCai"),
        dataField: "numCai",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.purchases.modal.viewPurchases.table.provider"),
        dataField: "provider",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("page.purchases.modal.viewPurchases.table.total"),
        dataField: "valueTotal",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      }
    ],
    data: dataPurchases,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewPurchase,
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

export default ModalViewPurchases