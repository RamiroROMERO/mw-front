import { Colxx } from '@/components/common/CustomBootstrap'
import { SimpleSelect } from '@/components/simpleSelect';
import { IntlMessages } from '@/helpers/Utils';
import React from 'react'
import { Button, Card, CardBody, CardFooter, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useModalCompProduct } from './useModalCompProduct';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import DataTable from '@/components/reactTable';

export const ModalCompProduct = ({ data }) => {

  const { productCode: fatherCode, productName, setLoading, listProducts } = data;

  const listProductsFilter = listProducts.filter(elem => elem.code !== fatherCode);

  const { formState, formValidation, onInputChange, sendForm, propsTable, fnSave, fnReset } = useModalCompProduct({ setLoading, fatherCode });

  const { productCode, qty, status } = formState;
  const { productCodeValid, qtyValid } = formValidation;


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
              <Colxx xxs={12} md={8}>
                <SearchSelect
                  value={productCode}
                  name="productCode"
                  onChange={onInputChange}
                  options={listProductsFilter}
                  label="select.productId"
                  invalid={sendForm && !!productCodeValid}
                  feedbackText={sendForm && (productCodeValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} md={3}>
                <InputField
                  label="page.invoicing.input.qtyProd"
                  id="qty"
                  name="qty"
                  type="number"
                  value={qty}
                  onChange={onInputChange}
                  invalid={sendForm && !!qtyValid}
                  feedbackText={sendForm && (qtyValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} md={3}>
                <Checkbox
                  label="check.status"
                  id="status"
                  name="status"
                  value={status}
                  onChange={onInputChange}
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
      <ModalFooter>

      </ModalFooter>
    </>
  )
}
