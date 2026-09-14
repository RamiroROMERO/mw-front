import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { RadioGroup } from "@Components/radioGroup";
import ViewPdf from "@Components/ViewPDF/ViewPdf";
import Modal from "@Components/modal";

// Antes desconectado de cualquier botón (código muerto) — ahora lo abre el botón
// "Imprimir" del panel principal (fnPrintInvoicing en Content.jsx), igual que el
// legacy (btnPrintDocument ofrecía varios layouts de impresión al imprimir).
const ModalPrintInvoice = (props) => {
  const { data, setOpen } = props;
  const { id, setLoading } = data;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const [typePrint, setTypePrint] = useState("1");
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const mapSetValue = {
    typePrint: { setValue: setTypePrint }
  }

  const handleInputChange = e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    mapSetValue[e.target.name].setValue(value)
  }

  const fnPrintInvoice = () => {
    setLoading(true);
    const endpoint = typePrint === "3" ? 'billing/process/invoices/exportPDFByType' : 'billing/process/invoices/exportPDF';
    request.GETPdfUrl(endpoint, { id, userName: userData.name }, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "page.invoicing.modal.printInvoice.title",
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="page.invoicing.title.printType"
              name="typePrint"
              value={typePrint}
              onChange={handleInputChange}
              options={
                [
                  { id: 1, label: "page.invoicing.modal.printInvoice.radio.detailed" },
                  { id: 3, label: "page.invoicing.modal.printInvoice.radio.summarized" }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintInvoice}><i className="iconsminds-printer" /> {IntlMessages("button.print")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToViewPDF} />
    </>
  )
}

export default ModalPrintInvoice;