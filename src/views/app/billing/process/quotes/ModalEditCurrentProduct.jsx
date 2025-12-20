import React, { useEffect, useState } from 'react'
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { formatNumber, IntlMessages, validFloat } from '@Helpers/Utils';
import { useForm } from '@Hooks';

export const ModalEditCurrentProduct = (props) => {

  const { data } = props;
  const { currentItem, fnSave } = data;

  const [openAccord, setOpenAccord] = useState('1');
  const toggleAccord = (id) => {
    if (openAccord === id) {
      setOpenAccord();
    } else {
      setOpenAccord(id);
    }
  };

  const { formState, onInputChange, onBulkForm } = useForm({ ...currentItem });
  const { productCode, productName, undOutId, undOutName, qtyDist, price, qty, subtotal, discountPercent, discountValue, taxPercent, taxValue, total, stock, min, med, max } = formState;

  useEffect(() => {

    let newSubtotal = validFloat(qty) * validFloat(price);
    let newDiscount = validFloat(newSubtotal * (validFloat(discountPercent) / 100), 2)
    let newTax = validFloat((newSubtotal - newDiscount) * (validFloat(taxPercent) / 100), 2);
    let newTotal = newSubtotal - newDiscount + newTax;

    onBulkForm({ subtotal: newSubtotal, taxValue: newTax, discountValue: newDiscount, total: newTotal });

  }, [qty, price, discountPercent, taxPercent])

  //TODO
  // useEffect(()=>{
  //   if(validFloat(qty)> validFloat(stock)){

  //   }
  // }, [qty])

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <InputField
              label='input.productCode'
              name={"productCode"}
              value={productCode}
              onChange={onInputChange}
              disabled
            />
          </Colxx>
          <Colxx xxs={12}>
            <InputField
              label='page.storesProducts.select.product'
              name={"productName"}
              value={productName}
              onChange={onInputChange}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label='input.outputUnit'
              name={"undOutName"}
              value={undOutName}
              onChange={onInputChange}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label='input.currentExistence'
              name={"stock"}
              value={stock}
              onChange={onInputChange}
              disabled
            />
          </Colxx>

          <Colxx xxs={12} md={6}>
            <InputField
              label='input.qty'
              name={"qty"}
              value={qty}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label='input.price'
              name={"price"}
              value={price}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <Accordion flush open={openAccord} toggle={toggleAccord} className='mb-4'>
              <AccordionItem>
                <AccordionHeader tag='p' targetId={1} >Precios Disponibles</AccordionHeader>
                <AccordionBody>
                  <Table size='sm'>
                    <thead>
                      <tr>
                        <th className='text-center'>
                          Precio 1
                        </th>
                        <th className='text-center'>
                          Precio 2
                        </th>
                        <th className='text-center'>
                          Precio 3
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <Button color='light' size='sm' block onClick={() => { onInputChange({ target: { name: 'price', value: min } }) }}> {min} </Button>
                        </td>
                        <td>
                          <Button color='light' size='sm' block onClick={() => { onInputChange({ target: { name: 'price', value: med } }) }}> {med} </Button>
                        </td>
                        <td>
                          <Button color='light' size='sm' block onClick={() => { onInputChange({ target: { name: 'price', value: max } }) }}> {max} </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </AccordionBody>
              </AccordionItem>
            </Accordion>


          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <InputField
              label='input.subtotal'
              name={"subtotal"}
              value={subtotal}
              onChange={onInputChange}
              disabled
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label={'input.discount'}>
              <Row>
                <Colxx xxs={12} sm={5}>
                  <InputField
                    label='input.percent'
                    name={"discountPercent"}
                    value={discountPercent}
                    onChange={onInputChange}

                  />
                </Colxx>
                <Colxx xxs={12} sm={7}>
                  <InputField
                    label='input.discount'
                    name={"discountValue"}
                    value={discountValue}
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label={'input.tax'}>
              <Row>
                <Colxx xxs={12} sm={5}>
                  <InputField
                    label='input.percent'
                    name={"taxPercent"}
                    value={taxPercent}
                    onChange={onInputChange}

                  />
                </Colxx>
                <Colxx xxs={12} sm={7}>
                  <InputField
                    label='input.tax'
                    name={"taxValue"}
                    value={taxValue}
                    onChange={onInputChange}
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
            <h3 className='text-right'>
              {`Total: ${formatNumber(total, 'Lps. ', 2)}`}
            </h3>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Row>
          <Colxx xxs={12}>
            <Button color='primary' onClick={() => fnSave(formState)}>
              <i className="bi bi-floppy" />
              {` ${IntlMessages('button.save')}`}
            </Button>
          </Colxx>
        </Row>
      </ModalFooter>
    </>
  )
}
