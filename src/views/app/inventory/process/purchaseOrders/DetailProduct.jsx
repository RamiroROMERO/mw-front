import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { Checkbox } from '@Components/checkbox'
import { formatNumber, IntlMessages, validFloat, validInt } from '@Helpers/Utils'
import { Button, Input, InputGroup, Row } from 'reactstrap'
import { InputLabel } from '@Components/inputLabel'
import { calculateLine, validateLine, MAX_PRODUCT_CODE } from './purchaseOrderRules'

const DetailProduct = ({productCode, nameProduct, marca, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total,
  nameUM, undId, conversionFactor, unitOptions, isExonerated, onUnitChange, onExoneratedChange, onInputChangeDeta, fnViewProducts,
  setBulkFormDeta, orderDetail, setOrderDetail, fnRecalculateTotals, errorsDeta, setSendFormDeta}) => {

  // Los valores de la línea se recalculan con las mismas reglas del back (purchaseOrderRules.js) cada vez que cambia un dato.
  const recalc = (changes) => {
    const values = { qty, price, percentDiscount, percentTax, isExonerated, ...changes };
    const { subTotal: newSubTotal, discount: newDiscount, tax: newTax, total: newTotal } = calculateLine(values);
    setBulkFormDeta({ ...changes, subTotal: newSubTotal, discount: newDiscount, tax: newTax, total: newTotal });
  }

  const onQtyChange = e => recalc({ qty: e.target.value });
  const onPriceChange = e => recalc({ price: e.target.value });
  const onDiscountChange = e => recalc({ percentDiscount: e.target.value });
  const onTaxChange = e => recalc({ percentTax: e.target.value });

  const fnAddProduct = ()=>{
    setSendFormDeta(true);
    const currentLine = { productCode, undId, qty, price, percentDiscount, percentTax };
    if(Object.keys(validateLine(currentLine)).length > 0){
      return;
    }

    const values = calculateLine({ qty, price, percentDiscount, percentTax, isExonerated });
    const detail = {
      id: new Date().getTime(),
      productCode,
      nameProduct,
      marca,
      qty: validFloat(qty),
      qtyReceived: 0,
      qtyRec: 0,
      qtyMissing: validFloat(qty),
      price: validFloat(price),
      percentDiscount: validFloat(percentDiscount),
      ...values,
      nameUM,
      undId: validInt(undId),
      conversionFactor: validFloat(conversionFactor) || 1,
      // Legacy (tax_type): 1 = Exonerado (checkbox), no un tramo de impuesto derivado.
      isExonerated: !!isExonerated
    }

    const newArray = [...orderDetail, detail];
    setOrderDetail(newArray);
    fnRecalculateTotals(newArray);

    // limpiar inputs para agregar otro producto
    const cleanProd = {
      productCode: "",
      nameProduct: "",
      marca: "",
      qty: 1,
      price: 0,
      subTotal: 0,
      percentDiscount: 0,
      discount: 0,
      percentTax: 0,
      tax: 0,
      total: 0,
      nameUM: "",
      undId: 0,
      conversionFactor: 1,
      unitOptions: [],
      isExonerated: false
    }
    setBulkFormDeta(cleanProd);
    setSendFormDeta(false);
  }

  return (
    <Row className='mt-3'>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.purchaseOrders.title.addProducts">
          <Row>
            <Colxx xxs="12" xs="5" md="3" lg="2">
              {/* Legacy: F1 abre el buscador de productos; aquí es un input con lupa a la derecha que abre el mismo buscador. */}
              <InputLabel label='page.purchaseOrders.input.productCodeRequired' feedbackText={errorsDeta.productCode || null}>
                <InputGroup size="sm">
                  <Input
                    bsSize="sm"
                    name="productCode"
                    id="productCode"
                    value={productCode}
                    type="text"
                    readOnly
                    maxLength={MAX_PRODUCT_CODE}
                    onClick={fnViewProducts}
                    invalid={!!errorsDeta.productCode}
                    style={{ cursor: 'pointer', resize: 'none', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Button color="secondary" outline onClick={fnViewProducts} title={IntlMessages("page.purchaseOrders.input.productCode")}>
                    <i className="bi bi-search" />
                  </Button>
                </InputGroup>
              </InputLabel>
            </Colxx>
            <Colxx xxs="12" xs="7" md="4" lg="3">
              <InputField
                name="nameProduct"
                label='page.purchaseOrders.input.nameProduct'
                value={nameProduct}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="3" lg="2">
              <SimpleSelect
                name="undId"
                label='page.purchaseOrders.input.unitRequired'
                value={undId}
                onChange={onUnitChange}
                options={unitOptions}
                invalid={!!errorsDeta.undId}
                feedbackText={errorsDeta.undId || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="qty"
                label='page.purchaseOrders.input.qtyRequired'
                value={qty}
                onChange={onQtyChange}
                type="text"
                invalid={!!errorsDeta.qty}
                feedbackText={errorsDeta.qty || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="price"
                label='page.purchaseOrders.input.priceRequired'
                value={price}
                onChange={onPriceChange}
                type="text"
                invalid={!!errorsDeta.price}
                feedbackText={errorsDeta.price || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="subTotal"
                label='page.purchaseOrders.input.subTotal'
                value={subTotal}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="percentDiscount"
                label='page.purchaseOrders.input.percentDiscount'
                value={percentDiscount}
                onChange={onDiscountChange}
                type="text"
                invalid={!!errorsDeta.percentDiscount}
                feedbackText={errorsDeta.percentDiscount || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="discount"
                label='page.purchaseOrders.input.discount'
                value={formatNumber(discount)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="percentTax"
                label='page.purchaseOrders.input.percentTax'
                value={percentTax}
                onChange={onTaxChange}
                type="text"
                invalid={!!errorsDeta.percentTax}
                feedbackText={errorsDeta.percentTax || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="tax"
                label='page.purchaseOrders.input.tax'
                value={formatNumber(tax)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2" className="d-flex align-items-end">
              <Checkbox
                name="isExonerated"
                label="page.purchaseOrders.checkbox.exonerated"
                value={isExonerated}
                onChange={onExoneratedChange}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="total"
                label='page.purchaseOrders.input.total'
                value={formatNumber(total)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2" align="right">
              <Button color="primary" onClick={() => {fnAddProduct()}}>
                <i className='bi bi-plus' /> {IntlMessages("button.add")}
              </Button>
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}

export default DetailProduct