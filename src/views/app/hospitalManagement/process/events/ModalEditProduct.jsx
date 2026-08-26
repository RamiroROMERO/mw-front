import { useEffect } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { formatNumber, IntlMessages, validFloat } from '@Helpers/Utils';
import { useForm } from '@Hooks';

const ModalEditProduct = ({ data, setOpen }) => {
  const { currentItem, fnSave } = data;

  const { formState, onInputChange, onBulkForm } = useForm({ ...currentItem });
  const { productCode, description, quantity, price, subtotal, discPercent, discount, taxPercent, taxValue, total } = formState;

  useEffect(() => {
    const newSubtotal = validFloat(quantity) * validFloat(price);
    const newDiscount = validFloat(newSubtotal * (validFloat(discPercent) / 100), 2);
    const newTax = validFloat((newSubtotal - newDiscount) * (validFloat(taxPercent) / 100), 2);
    const newTotal = newSubtotal - newDiscount + newTax;

    onBulkForm({ subtotal: newSubtotal, discount: newDiscount, taxValue: newTax, total: newTotal });
  }, [quantity, price, discPercent, taxPercent]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} sm={6}>
            <InputField
              label="table.column.code"
              name="productCode"
              value={productCode}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField
              label="table.column.description"
              name="description"
              value={description}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField
              label="table.column.qty"
              name="quantity"
              value={quantity}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField
              label="table.column.price"
              name="price"
              value={price}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12}>
            <InputField
              label="input.subtotal"
              name="subtotal"
              value={subtotal}
              disabled
            />
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="input.discount">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.percent"
                    name="discPercent"
                    value={discPercent}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.discount"
                    name="discount"
                    value={discount}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="input.tax">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.percent"
                    name="taxPercent"
                    value={taxPercent}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.tax"
                    name="taxValue"
                    value={taxValue}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <h5 className="text-end">{`${IntlMessages("table.column.total")}: ${formatNumber(total, '', 2)}`}</h5>
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
