import { useEffect, useMemo, useState } from 'react'
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { calculateLine, discountPercentFromValue, priceChoices, validateLine } from './quoteRules';

// Línea de la cotización (SPEC v2-66-sr). Sin el permiso de editar precio del perfil del usuario el precio solo se elige entre los tres del producto (el
// back lo vuelve a exigir). El impuesto es el del producto o 0 (línea exenta). El descuento se digita en porcentaje o por valor (F2 del legacy), que se
// convierte a porcentaje del subtotal.
export const ModalEditCurrentProduct = (props) => {

  const { data } = props;
  const { currentItem, fnSave, canEditPrice = false } = data;

  const [openAccord, setOpenAccord] = useState('1');
  const [sendForm, setSendForm] = useState(false);
  const toggleAccord = (id) => {
    if (openAccord === id) {
      setOpenAccord();
    } else {
      setOpenAccord(id);
    }
  };

  const { formState, onInputChange, onBulkForm } = useForm({ ...currentItem });
  const { productCode, productName, unitProd, price, qty, subtotal, discountPercent, discountValue, taxPercent, taxValue, total, stock, productTax } = formState;

  // IntlMessages es un hook: se pide una vez aquí arriba, nunca dentro de una condición.
  const priceLockedText = IntlMessages('page.quotes.priceLocked');

  const choices = useMemo(() => priceChoices(currentItem), [currentItem]);
  const lineError = validateLine(formState);
  const errorOf = (id) => (sendForm && lineError === id ? id : null);

  useEffect(() => {
    onBulkForm(calculateLine({ qty, price, discountPercent, taxPercent }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, price, discountPercent, taxPercent]);

  // F2 del legacy: el descuento digitado como valor se convierte a porcentaje del subtotal.
  const onDiscountValueChange = ({ target }) => {
    onBulkForm({ discountPercent: discountPercentFromValue(target.value, subtotal) });
  };

  // El impuesto de la línea es el del producto o 0: la casilla alterna entre los dos.
  const taxableTax = Number(productTax) > 0 ? Number(productTax) : 0;
  const isExempt = Number(taxPercent) === 0 && taxableTax > 0;
  const onExemptChange = ({ target }) => {
    onBulkForm({ taxPercent: target.checked ? 0 : taxableTax });
  };

  const onSave = () => {
    setSendForm(true);
    if (lineError) return;
    fnSave(formState);
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <InputField label='input.productCode' name={"productCode"} value={productCode} onChange={onInputChange} disabled />
          </Colxx>
          <Colxx xxs={12}>
            <InputField label='page.storesProducts.select.product' name={"productName"} value={productName} onChange={onInputChange} disabled />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField label='input.outputUnit' name={"unitProd"} value={unitProd} onChange={onInputChange} disabled />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField label='input.currentExistence' name={"stock"} value={stock ?? ''} onChange={onInputChange} disabled />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label='input.qty'
              name={"qty"}
              value={qty}
              onChange={onInputChange}
              invalid={!!errorOf('page.quotes.error.line.qty')}
              feedbackText={errorOf('page.quotes.error.line.qty')}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label='input.price'
              name={"price"}
              value={price}
              onChange={onInputChange}
              disabled={!canEditPrice}
              invalid={!!errorOf('page.quotes.error.line.price')}
              feedbackText={errorOf('page.quotes.error.line.price')}
            />
          </Colxx>
        </Row>
        {!canEditPrice && <p className='text-muted small'>{priceLockedText}</p>}
        <Row>
          <Colxx xxs={12}>
            <Accordion flush open={openAccord} toggle={toggleAccord} className='mb-4'>
              <AccordionItem>
                <AccordionHeader tag='p' targetId={1} >Precios Disponibles</AccordionHeader>
                <AccordionBody>
                  <Table size='sm'>
                    <tbody>
                      <tr>
                        {choices.map((value) => (
                          <td key={value}>
                            <Button color='light' size='sm' block onClick={() => { onInputChange({ target: { name: 'price', value } }) }}> {value} </Button>
                          </td>
                        ))}
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
            <InputField label='input.subtotal' name={"subtotal"} value={subtotal} onChange={onInputChange} disabled />
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
                    invalid={!!errorOf('page.quotes.error.line.discount')}
                    feedbackText={errorOf('page.quotes.error.line.discount')}
                  />
                </Colxx>
                <Colxx xxs={12} sm={7}>
                  <InputField label='input.discount' name={"discountValue"} value={discountValue} onChange={onDiscountValueChange} />
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
                  <InputField label='input.percent' name={"taxPercent"} value={taxPercent} onChange={onInputChange} disabled />
                </Colxx>
                <Colxx xxs={12} sm={7}>
                  <InputField label='input.tax' name={"taxValue"} value={taxValue} onChange={onInputChange} disabled />
                </Colxx>
              </Row>
              {taxableTax > 0 && <Checkbox label='page.quotes.taxExempt' name='isExempt' value={isExempt} onChange={onExemptChange} />}
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <h3 className='text-end'>
              {`Total: ${formatNumber(total, 'Lps. ', 2)}`}
            </h3>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Row>
          <Colxx xxs={12}>
            <Button color='primary' onClick={onSave}>
              <i className="bi bi-floppy" />
              {` ${IntlMessages('button.save')}`}
            </Button>
          </Colxx>
        </Row>
      </ModalFooter>
    </>
  )
}
