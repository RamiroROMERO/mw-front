import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, validFloat } from "@Helpers/Utils";
import { InputField } from "@Components/inputFields";
import SearchSelect from "@Components/SearchSelect/SearchSelect";
import ReactTable from "@Components/reactTable";
import Modal from "@Components/modal";
import { ModalViewCxc } from "./ModalViewCxc";

// A diferencia de CxP (que ya viene filtrado por el proveedor del encabezado), el cliente a
// abonar se elige aquí mismo — una Transferencia no necesariamente tiene un cliente ligado
// en el encabezado (ver useTransfers.fnGetPendingCxc).
export const ModalCxc = (props) => {
  const { setOpen, data } = props;
  const {
    cxcPayments = [], fnRemoveCxcPayment, openModalUnpaidInvoice, setOpenModalUnpaidInvoice,
    pendingCxc, fnGetPendingCxc, fnApplyCxcPayment, listCustomer
  } = data;

  const [customerId, setCustomerId] = useState('');

  const total = cxcPayments.reduce((sum, p) => sum + (validFloat(p.paidValue) || 0), 0);

  const table = {
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.nInvoice"), dataField: "documentCode", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.customer"), dataField: "customerName", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.value"), dataField: "paidValue", headerStyle: { 'width': '15%' } },
    ],
    data: cxcPayments,
    actions: [{
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnRemoveCxcPayment
    }]
  };

  const propsToModalUnpaidInvoice = {
    ModalContent: ModalViewCxc,
    title: "page.transfers.modalInvoiceUnpaid.title",
    open: openModalUnpaidInvoice,
    setOpen: setOpenModalUnpaidInvoice,
    maxWidth: 'lg',
    data: { pendingCxc, fnApplyCxcPayment }
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12" xs="8" sm="8" md="9">
            <SearchSelect
              name="customerId"
              inputValue={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              label="page.transfers.select.customer"
              options={listCustomer}
            />
          </Colxx>
          <Colxx xxs="12" xs="4" sm="4" md="3" align="right">
            <Button color="primary" title={IntlMessages("button.add")} onClick={() => fnGetPendingCxc(customerId)}>
              <i className='bi bi-plus' /> {IntlMessages("button.add")}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="6" xs="8" sm="8" md="8" lg="9"></Colxx>
          <Colxx xss="6" xs="4" sm="4" md="4" lg="3">
            <InputField
              name="total"
              value={total.toFixed(2)}
              onChange={() => { }}
              type="text"
              label="input.total"
              disabled
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalUnpaidInvoice} />
    </>
  )
}
