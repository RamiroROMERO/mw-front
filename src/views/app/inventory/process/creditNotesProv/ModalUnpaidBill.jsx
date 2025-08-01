import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { ReactTableEdit } from '@/components/reactTableEdit';
import { IntlMessages } from '@/helpers/Utils';

const ModalUnpaidBill = ({setOpen, data}) => {

  const [dataUnpaidBills, setDataUnpaidBills] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.creditNotesProv.modal.unpaidBills.table.title"),
    columns: [
      {
        label: "table.column.date", field: "date",
        headerStyle:{
          textAlign: 'center',
          width:'10%'
        },
        bodyStyle:{
          width:'10%'
        }
      },
      {
        label: "table.column.noInvoice", field: "noInvoice",
        headerStyle:{
          textAlign: 'center',
          width:'15%'
        },
        bodyStyle:{
          width:'15%'
        }
      },
      {
        label: "table.column.provider", field: "provider",
        headerStyle:{
          textAlign: 'center',
          width:'35%'
        },
        bodyStyle:{
          width:'35%'
        }
      },
      {
        label: "page.creditNotesProv.modal.unpaidBills.invoiceBalance", field: "invoiceBalance",
        headerStyle:{
          textAlign: 'center',
          width:'20%'
        },
        bodyStyle:{
          width:'20%'
        }
      },
      {
        label: "page.creditNotesProv.modal.unpaidBills.table.valuePaid", field: "valuePaid",  isEditable:true,
        headerStyle:{
          textAlign: 'center',
          width:'20%'
        },
        bodyStyle:{
          width:'20%'
        }
      }
    ],
    data:dataUnpaidBills,
    onChangeData: setDataUnpaidBills,
    options: {
      columnActions: "options",
      tableHeight:'300px'
    }
  });

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <ReactTableEdit {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary">
      <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}}>
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalUnpaidBill