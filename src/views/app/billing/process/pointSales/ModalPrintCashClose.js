import React, { useState } from "react";
import { Colxx } from "@/components/common/CustomBootstrap";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { RadioGroup } from "@/components/radioGroup";
import { request } from "@/helpers/core";

const ModalPrintCashClose = (props) => {
  const { data, setOpen } = props;
  const { id, date, idCashier, idCash, listCashiers, listCashBoxes, initValue, cashValue, total, missingExcess, printType, setLoading } = data;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const [typePrint, setTypePrint] = useState(1);
  const [typeSheet, setTypeSheet] = useState(printType);

  const mapSetValue = {
    typePrint: { setValue: setTypePrint },
    typeSheet: { setValue: setTypeSheet }
  }

  const handleInputChange = e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    mapSetValue[e.target.name].setValue(value);
  }

  const fnPrintDocument = () => {
    const filterCashier = listCashiers.filter((item) => {
      return item.value === validInt(idCashier);
    });
    const filterCashBoxes = listCashBoxes.filter((item) => {
      return item.id === validInt(idCash);
    });
    const dataPrint = {
      id,
      userName: userData.name,
      date,
      cashierId: idCashier,
      cashId: idCash,
      cashName: filterCashBoxes[0].name,
      cashier: filterCashier[0].name,
      initValue,
      cashValue,
      total,
      missingExcess,
      typePrint: typeSheet
    }
    if (validInt(typePrint) === 1) {
      request.GETPdf('billing/process/cashClose/exportPDFSummary', dataPrint, 'Cierre de Caja Resumido.pdf', (err) => {

        setLoading(false);
      });
    } else if (validInt(typePrint) === 2) {
      request.GETPdf('billing/process/cashClose/exportPDFDetail', dataPrint, 'Cierre de Caja Detallado.pdf', (err) => {

        setLoading(false);
      });
    } else if (validInt(typePrint) === 3) {
      request.GETPdf('billing/process/cashClose/exportPDFByArea', dataPrint, 'Cierre de Caja por Area de Facturación', (err) => {

        setLoading(false);
      });
    } else if (validInt(typePrint) === 5) {
      request.GETPdf('billing/process/cashClose/exportPDFDaily', dataPrint, 'Cierre de Caja Global', (err) => {

        setLoading(false);
      });
    } else if (validInt(typePrint) === 7) {
      request.GETPdf('billing/process/cashClose/exportPDFExpenses', dataPrint, 'Detalle de Gastos', (err) => {

        setLoading(false);
      });
    } else if (validInt(typePrint) === 8) {
      request.GETPdf('billing/process/cashClose/exportPDFCancellations', dataPrint, 'Detalle de Cancelaciones', (err) => {

        setLoading(false);
      });
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.pointSales.modal.printCashClose.title.type"
              name="typePrint"
              value={typePrint}
              onChange={handleInputChange}
              options={
                [
                  { id: 1, label: "page.pointSales.modal.printCashClose.summary" },
                  { id: 2, label: "page.pointSales.modal.printCashClose.detailed" },
                  { id: 3, label: "page.pointSales.modal.printCashClose.billingArea" },
                  // {id:4, label:"page.pointSales.modal.printCashClose.paymentMethod"},
                  { id: 5, label: "page.pointSales.modal.printCashClose.totalDailyClosings" },
                  { id: 6, label: "page.pointSales.modal.printCashClose.deposits" },
                  { id: 7, label: "page.pointSales.modal.printCashClose.detailExpenses" },
                  { id: 8, label: "page.pointSales.modal.printCashClose.cancellations" },
                ]
              }
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.pointSales.modal.printCashClose.title.typeSheet"
              name="typeSheet"
              value={typeSheet}
              onChange={handleInputChange}
              options={
                [
                  { id: 1, label: "page.invoicing.radio.ticket" },
                  { id: 3, label: "page.invoicing.radio.letter" }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintDocument}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalPrintCashClose;