import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import { printDocument } from '@Helpers/printDocument';
import { RadioGroup } from "@Components/radioGroup";
import { invoicePrintOptions } from './invoicePrintRules';

// Imprimir la factura (SPEC v2-74-sr): el back imprime lo GUARDADO por GET; aquí solo se elige el formato (Detallada o Resumida por Tipo) y la moneda de impresión
// (la de la factura por defecto; en Dólares el back usa el tipo de cambio guardado y rechaza si falta, con su mensaje).
const ModalPrintInvoice = (props) => {
  const { data, setOpen } = props;
  const { id, setLoading } = data;

  const [typePrint, setTypePrint] = useState("1");
  const [currency, setCurrency] = useState("0");

  const mapSetValue = {
    typePrint: { setValue: setTypePrint },
    currency: { setValue: setCurrency }
  }

  const handleInputChange = e => {
    mapSetValue[e.target.name].setValue(e.target.value)
  }

  const fnPrintInvoice = () => {
    printDocument({ ...invoicePrintOptions({ id, format: typePrint === "3" ? 'byType' : 'detailed', currency }), setLoading });
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
          <Colxx xxs="12">
            <RadioGroup
              label="page.invoicing.title.printCurrency"
              name="currency"
              value={currency}
              onChange={handleInputChange}
              options={
                [
                  { id: 0, label: "page.invoicing.modal.printInvoice.radio.currencyInvoice" },
                  { id: 1, label: "page.invoicing.modal.printInvoice.radio.lempiras" },
                  { id: 2, label: "page.invoicing.modal.printInvoice.radio.dollars" }
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
