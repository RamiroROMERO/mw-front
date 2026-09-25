import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, validFloat } from "@Helpers/Utils";
import { InputField } from "@Components/inputFields";
import ReactTable from "@Components/reactTable";
import Modal from "@Components/modal";
import { ModalViewCxp } from "./ModalViewCxp";

export const ModalCxp = (props) => {
  const { setOpen, data } = props;
  const {
    cxpPayments = [], fnRemoveCxpPayment, openModalUnpaidBill, setOpenModalUnpaidBill,
    pendingCxp, fnGetPendingCxp, fnApplyCxpPayment
  } = data;

  const total = cxpPayments.reduce((sum, p) => sum + (validFloat(p.paidValue) || 0), 0);

  const table = {
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.nInvoice"), dataField: "documentCode", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.value"), dataField: "paidValue", headerStyle: { 'width': '15%' } },
    ],
    data: cxpPayments,
    actions: [{
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnRemoveCxpPayment
    }]
  };

  const propsToModalUnpaidBill = {
    ModalContent: ModalViewCxp,
    title: "page.checks.modalBillUnpaid.title",
    open: openModalUnpaidBill,
    setOpen: setOpenModalUnpaidBill,
    maxWidth: 'lg',
    data: { pendingCxp, fnApplyCxpPayment }
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx align="right">
            <Button color="primary" title={IntlMessages("button.add")} onClick={fnGetPendingCxp}>
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
      <Modal {...propsToModalUnpaidBill} />
    </>
  )
}
