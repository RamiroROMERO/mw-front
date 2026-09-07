import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { RadioGroup } from "@Components/radioGroup";
import { IntlMessages, validFloat, validInt } from "@Helpers/Utils";
import { useForm } from "@Hooks";

const DISCOUNT_TYPE_PERCENT = 1;
const DISCOUNT_TYPE_VALUE = 2;

const ModalGlobalDiscount = (props) => {
  const { data, setOpen } = props;
  const { total, hasExistingDiscounts, fnConfirm } = data;
  const [sendForm, setSendForm] = useState(false);

  const discountValid = {
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"]
  }

  const { formState, formValidation, isFormValid, onInputChange } = useForm({
    discountType: DISCOUNT_TYPE_PERCENT,
    value: 0
  }, discountValid);

  const { discountType, value } = formState;
  const { valueValid } = formValidation;

  const fnAccept = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if (validInt(discountType) === DISCOUNT_TYPE_PERCENT && validFloat(value) > 100) {
      return;
    }
    if (validInt(discountType) === DISCOUNT_TYPE_VALUE && validFloat(value) > validFloat(total)) {
      return;
    }
    fnConfirm(validInt(discountType), validFloat(value));
  }

  return (
    <>
      <ModalBody>
        {hasExistingDiscounts && (
          <Row>
            <Colxx xxs="12">
              <p className="text-warning">{IntlMessages("msg.warning.globalDiscount.overwrite")}</p>
            </Colxx>
          </Row>
        )}
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              name="discountType"
              value={discountType}
              onChange={onInputChange}
              display="flex"
              options={[
                { id: DISCOUNT_TYPE_PERCENT, label: "page.pointSales.modal.globalDiscount.radio.percent" },
                { id: DISCOUNT_TYPE_VALUE, label: "page.pointSales.modal.globalDiscount.radio.value" }
              ]}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="value"
              label="page.pointSales.modal.globalDiscount.input.value"
              value={value}
              onChange={onInputChange}
              type="number"
              invalid={sendForm && !!valueValid}
              feedbackText={sendForm && (valueValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" />{IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalGlobalDiscount;
