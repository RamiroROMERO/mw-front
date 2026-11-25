import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { previewLine, validateUpdate } from './eventDetailRules';

// SPEC v2-152-sr: la cantidad se cambia siempre; el precio y el descuento solo con el permiso de editar precios (perfil del usuario). El impuesto es el del producto. Los valores de
// pantalla son una vista previa: el back recalcula y guarda.
const ModalEditProduct = ({ data, setOpen }) => {
  const { currentItem, canEditPrice = false, fnSave } = data;

  const { formState, onInputChange } = useForm({ ...currentItem });
  const { productCode, description, quantity, price, discPercent, taxPercent } = formState;
  const preview = previewLine({ quantity, price, discPercent, taxPercent });
  const problems = validateUpdate(formState, canEditPrice);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} sm={6}>
            <InputField label="table.column.code" name="productCode" value={productCode} disabled />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="table.column.description" name="description" value={description} disabled />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="table.column.qty" name="quantity" value={quantity} onChange={onInputChange} invalid={!!problems.quantity} feedbackText={problems.quantity || null} />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="table.column.price" name="price" value={price} onChange={onInputChange} disabled={!canEditPrice} invalid={!!problems.price} feedbackText={problems.price || null} />
          </Colxx>
          <Colxx xxs={12}>
            <InputField label="input.subtotal" name="subtotal" value={preview.subtotal} disabled />
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="input.discount">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField label="input.percent" name="discPercent" value={discPercent} onChange={onInputChange} disabled={!canEditPrice} invalid={!!problems.discPercent} feedbackText={problems.discPercent || null} />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField label="input.discount" name="discount" value={preview.discount} disabled />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="input.tax">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField label="input.percent" name="taxPercent" value={taxPercent} disabled />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField label="input.tax" name="taxValue" value={preview.taxValue} disabled />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <h5 className="text-end">{`${IntlMessages("table.column.total")}: ${formatNumber(preview.total, '', 2)}`}</h5>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => fnSave(formState)}>
          <i className="bi bi-floppy" /> {IntlMessages('button.save')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEditProduct
