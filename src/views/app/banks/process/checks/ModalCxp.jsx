import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Table } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { InputField } from "@/components/inputFields";
import { useForm } from "@/hooks";
import Modal from "@/components/modal";
import { ModalViewCxp } from "./ModalViewCxp";

export const ModalCxp = (props) => {
  const { setOpen } = props;
  const [openModalUnpaidBill, setOpenModalUnpaidBill] = useState(false);

  const { onInputChange, formState } = useForm({
    id: 0,
    total: 0
  })

  const { id, total } = formState;

  const fnAddItem = () => {
    setOpenModalUnpaidBill(true);
  }

  const propsToModalBillUnpaid = {
    ModalContent: ModalViewCxp,
    title: "page.checks.modalBillUnpaid.title",
    open: openModalUnpaidBill,
    setOpen: setOpenModalUnpaidBill,
    maxWidth: 'lg',
    data: {
    }
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-5">
          <Colxx align="right">
            <Button color="primary" title={IntlMessages("button.add")}
              onClick={() => { fnAddItem() }}>
              <i className='bi bi-plus' /> {IntlMessages("button.add")}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Table bordered hover>
              <thead>
                <tr>
                  <th >{IntlMessages("table.column.nInvoice")}</th>
                  <th>{IntlMessages("table.column.provider")}</th>
                  <th >{IntlMessages("table.column.value")}</th>
                  <th>{IntlMessages("table.column.options")}</th>
                </tr>
              </thead>
            </Table>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="6" xs="8" sm="8" md="8" lg="9"></Colxx>
          <Colxx xss="6" xs="4" sm="4" md="4" lg="3">
            <InputField
              name="total"
              value={total}
              onChange={onInputChange}
              type="text"
              label="input.total"
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalBillUnpaid} />
    </>
  )
}
