import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import { useModalCosts } from './useModalCosts';

const ModalCosts = ({ data, setOpen }) => {

  const { productCode, productName } = data;

  const { formState, formValidation, sendForm, onInputChange, fnSave, fnCancel } = useModalCosts({
    setLoading: data.setLoading,
    productId: data.productId,
    productType: data.productType,
    costs: data.costs,
    setBulkForm: data.setBulkForm,
    setOpen
  });

  const { costValue, lastCostValue, maxCostValue } = formState;
  const { costValueValid, lastCostValueValid, maxCostValueValid } = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p><strong>{IntlMessages("select.productId")}</strong></p>
            <h6>{`${productCode} - ${productName}`}</h6>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12} md={4}>
            <InputField
              label="page.productsCatalog.modal.costs.input.costValue"
              name="costValue"
              type="number"
              min="0"
              step="any"
              value={costValue}
              onChange={onInputChange}
              invalid={sendForm && !!costValueValid}
              feedbackText={sendForm && (costValueValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={4}>
            <InputField
              label="page.productsCatalog.modal.costs.input.lastCostValue"
              name="lastCostValue"
              type="number"
              min="0"
              step="any"
              value={lastCostValue}
              onChange={onInputChange}
              invalid={sendForm && !!lastCostValueValid}
              feedbackText={sendForm && (lastCostValueValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={4}>
            <InputField
              label="page.productsCatalog.modal.costs.input.maxCostValue"
              name="maxCostValue"
              type="number"
              min="0"
              step="any"
              value={maxCostValue}
              onChange={onInputChange}
              invalid={sendForm && !!maxCostValueValid}
              feedbackText={sendForm && (maxCostValueValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save"></i> {` ${IntlMessages('button.save')}`}</Button>
        <Button color="secondary" onClick={fnCancel}><i className="bi bi-box-arrow-right"></i> {` ${IntlMessages('button.cancel')}`}</Button>
      </ModalFooter>
    </>
  )
}

export default ModalCosts;
