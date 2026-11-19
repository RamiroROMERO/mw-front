import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from "@Components/common/CustomBootstrap";
import { IntlMessages } from "@Helpers/Utils";
import { RadioGroup } from "@Components/radioGroup";
import { request, notifyError } from "@Helpers/core";
import { CASH_CLOSE_PATH } from "./posCashCloseRules";
import { availableTypes, sheetAllowed, buildPrintRequest } from "./posCashClosePrintRules";

// Impresión del cierre de caja (SPEC v2-88-sr): el servidor arma el reporte con lo guardado (o la vista previa si aún no se guardó); aquí solo se elige el tipo y la hoja.
const ModalPrintCashClose = (props) => {
  const { data, setOpen } = props;
  const { id, sessionId, date, cashierId, allCashiers, cashValue, isSupervisor, printType, setLoading } = data;
  const [type, setType] = useState("summary");
  const [sheet, setSheet] = useState(Number(printType) === 1 ? "thermal" : "letter");

  const thermalAllowed = sheetAllowed(type, "thermal");

  const fnPrint = () => {
    const { url, params, fileName } = buildPrintRequest({ path: CASH_CLOSE_PATH, id, sessionId, type, sheet, date, cashierId, allCashiers, cashValue });
    const stop = () => setLoading(false);
    setLoading(true);
    request.GETPdf(url, params, fileName, (err) => { stop(); notifyError(err, "msg.print.error"); }, "GET", stop);
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.pointSales.modal.printCashClose.title.type"
              name="typePrint"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={availableTypes(isSupervisor).map((item) => ({ id: item.id, label: item.label }))}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.pointSales.modal.printCashClose.title.typeSheet"
              name="typeSheet"
              value={thermalAllowed ? sheet : "letter"}
              onChange={(e) => setSheet(e.target.value)}
              options={[
                ...(thermalAllowed ? [{ id: "thermal", label: "page.invoicing.radio.ticket" }] : []),
                { id: "letter", label: "page.invoicing.radio.letter" }
              ]}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrint}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages("button.exit")}`}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalPrintCashClose;
