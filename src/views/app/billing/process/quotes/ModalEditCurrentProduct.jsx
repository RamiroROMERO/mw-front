import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { useForm } from '@/hooks';
import React from 'react'
import { ModalBody, ModalFooter } from 'reactstrap'

export const ModalEditCurrentProduct = (props) => {

  const { data } = props;
  const { currentItem, fnSaveCurrentItem } = data;

  const { formState, onInputChange } = useForm({ ...currentItem });
  const { productCode, productName, undOutId, undOutName, qtyDist, price, qty, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    total } = formState;
  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} md={5} lg={3}>
            <InputField
              label='input.productCode'
              name={"productCode"}
              value={productCode}
              onChange={onInputChange}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} md={7} lg={9}>
            <InputField
              label='page.storesProducts.select.product'
              name={"productName"}
              value={productName}
              onChange={onInputChange}
              disabled
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </>
  )
}
