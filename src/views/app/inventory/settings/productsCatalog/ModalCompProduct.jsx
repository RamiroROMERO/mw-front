import { Colxx } from '@Components/common/CustomBootstrap'
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';
import { Button, Card, CardBody, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useModalCompProduct } from './useModalCompProduct';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DataTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';

export const ModalCompProduct = ({ data }) => {

  const { productId: fatherId, productCode: fatherCode, productName, setLoading } = data;

  const {
    formState, formValidation, sendForm, isEdit, productOptions, units, onFieldChange, fnSave, fnReset, propsTable, propsToMsgDelete
  } = useModalCompProduct({ setLoading, fatherId, fatherCode });

  const { productCode, unitedOut, qty } = formState;
  const { productCodeValid, unitedOutValid, qtyValid } = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p><strong>{IntlMessages("select.productId")}</strong></p>
            <h6>{`${fatherCode} - ${productName}`}</h6>
          </Colxx>
        </Row>
        <hr />
        <Card className='mb-2'>
          <CardBody>
            <Row>
              <Colxx xxs={12} md={6}>
                <SearchSelect
                  label="page.productsCatalog.modal.compProduct.component"
                  name="productCode"
                  inputValue={productCode}
                  onChange={onFieldChange}
                  options={productOptions}
                  isDisabled={isEdit}
                  feedbackText={sendForm && (productCodeValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} md={3}>
                <SimpleSelect
                  label="page.productsCatalog.modal.compProduct.unit"
                  id="unitedOut"
                  name="unitedOut"
                  value={unitedOut}
                  options={units}
                  onChange={onFieldChange}
                  invalid={sendForm && !!unitedOutValid}
                  feedbackText={sendForm && (unitedOutValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} md={3}>
                <InputField
                  label="page.invoicing.input.qtyProd"
                  id="qty"
                  name="qty"
                  type="number"
                  value={qty}
                  onChange={onFieldChange}
                  invalid={sendForm && !!qtyValid}
                  feedbackText={sendForm && (qtyValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12} className='div-action-button-container'>
                <Button onClick={fnReset} className='btn btn-secondary'><i className='bi bi-stars'></i> {IntlMessages("button.clear")}</Button>
                <Button onClick={fnSave} className='btn btn-success'><i className='bi bi-floppy'></i> {IntlMessages("button.save")}</Button>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
        <Row>
          <Colxx xxs={12}>
            <DataTable {...propsTable} />
          </Colxx>
        </Row>
      </ModalBody>
      <Confirmation {...propsToMsgDelete} />
      <ModalFooter>

      </ModalFooter>
    </>
  )
}
