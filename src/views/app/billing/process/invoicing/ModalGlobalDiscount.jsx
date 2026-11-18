import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from "@Helpers/Utils";
import { applyGlobalDiscount, GLOBAL_DISCOUNT_PERCENT, GLOBAL_DISCOUNT_VALUE, globalDiscountPercent, validateGlobalDiscount } from "./invoicingRules";

// Descuento global (SPEC v2-71-sr): un porcentaje o un valor repartido sobre todas las líneas de la factura (como "Descuento Global" del POS del legacy).
// Reemplaza los descuentos que ya tengan las líneas; el servidor vuelve a calcular y validar todo al guardar.
const ModalGlobalDiscount = (props) => {
  const { data, setOpen } = props;
  const { lines, fnApply } = data;

  const [type, setType] = useState(GLOBAL_DISCOUNT_PERCENT);
  const [value, setValue] = useState('');
  const [send, setSend] = useState(false);

  const error = validateGlobalDiscount({ type, value }, lines);
  // IntlMessages es un hook: se pide una vez aquí arriba, nunca dentro de una condición.
  const replaceNote = IntlMessages("page.invoicing.modal.globalDiscount.replace");
  const hasDiscounts = lines.some((line) => Number(line.discountValue) > 0);

  const onAccept = () => {
    setSend(true);
    if (error) return;
    fnApply(applyGlobalDiscount(lines, globalDiscountPercent({ type, value }, lines)));
    setOpen(false);
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="page.invoicing.modal.globalDiscount.type"
              name="type"
              value={type}
              onChange={({ target }) => setType(Number(target.value))}
              options={[
                { id: GLOBAL_DISCOUNT_PERCENT, label: "page.invoicing.modal.globalDiscount.percent" },
                { id: GLOBAL_DISCOUNT_VALUE, label: "page.invoicing.modal.globalDiscount.value" }
              ]}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              label="page.invoicing.modal.globalDiscount.amount"
              name="value"
              value={value}
              onChange={({ target }) => setValue(target.value)}
              maxLength={12}
              invalid={send && !!error}
              feedbackText={send ? error : null}
            />
          </Colxx>
        </Row>
        {hasDiscounts && <p className="text-muted small">{replaceNote}</p>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onAccept}>{IntlMessages("button.accept")}</Button>
        <Button color="secondary" onClick={() => setOpen(false)}>{IntlMessages("button.cancel")}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalGlobalDiscount;
