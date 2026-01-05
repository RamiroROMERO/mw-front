import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { RadioGroup } from "@/components/radioGroup";

const ModalPrintInvoice = (props) => {
  const { data, setOpen } = props;
  const { id, setLoading } = data;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const [typePrint, setTypePrint] = useState(0);

  const mapSetValue = {
    typePrint: { setValue: setTypePrint }
  }

  const handleInputChange = e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    mapSetValue[e.target.name].setValue(value)
  }

  const fnPrintInvoice = () => {
    if (typePrint === "1") {
      request.GETPdf('billing/process/invoices/exportPDF', { id, userName: userData.name }, 'Factura Detallada.pdf', (err) => {

        setLoading(false);
      });
    } else if (typePrint === "3") {
      request.GETPdf('billing/process/invoices/exportPDFByType', { id, userName: userData.name }, 'Factura Resumida por Tipo.pdf', (err) => {

        setLoading(false);
      });
    }
    setOpen(false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="page.invoicing.modal.printInvoice.radio.detailed"
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
    </>
  )
}

export default ModalPrintInvoice;