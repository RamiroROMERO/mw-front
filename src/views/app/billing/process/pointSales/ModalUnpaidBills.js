import { Colxx } from "@/components/common/CustomBootstrap";
import { ReactTableEdit } from "@/components/reactTableEdit";
import React, { useState } from "react"
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages } from "@/helpers/Utils";

const ModalUnpaidBills = (props) => {
  const { data, setOpen } = props;

  const [dataUnpaidBills, setDataUnpaidBills] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.pointSales.modal.unpaidBills.table.title"),
    columns: [
      {
        label: "page.pointSales.modal.unpaidBills.table.date", field: "date",
        headerStyle: {
          textAlign: 'center',
          width: '10%'
        },
        bodyStyle: {
          width: '10%'
        }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.noInvoice", field: "noInvoice",
        headerStyle: {
          textAlign: 'center',
          width: '15%'
        },
        bodyStyle: {
          width: '15%'
        }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.customer", field: "customer",
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%'
        }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.invoiceBalance", field: "invoiceBalance",
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%'
        }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.valuePaid", field: "valuePaid", isEditable: true,
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%'
        }
      }
    ],
    data: dataUnpaidBills,
    onChangeData: setDataUnpaidBills,
    options: {
      columnActions: "options",
      tableHeight: '300px'
    }
  })

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTableEdit {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary">
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalUnpaidBills;