import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import { useModalCosts } from './useModalCosts';

const ModalCosts = ({ data, setOpen }) => {

  const { productCode, productName } = data;

  const { formState, onInputChange, fnSave, fnCancel } = useModalCosts({
    setLoading: data.setLoading,
    productId: data.productId,
    setBulkForm: data.setBulkForm,
    setOpen
  });

  const { newCostValue } = formState;

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
          <Colxx xxs={12} md={6}>
            <InputField
              label="page.productsCatalog.modal.costs.input.newCost"
              name="newCostValue"
              type="text"
              value={newCostValue}
              onChange={onInputChange}
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
