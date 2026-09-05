import { Row, Form, Button, Input, InputGroup } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { InputLabel } from '@Components/inputLabel';

const InvoicingDetail = (props) => {
  const { productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    totalProd, onInputDetaChange, handleQtyChange, handlePriceChange, handleDiscPercentChange, handleTaxPercentChange,
    fnViewProducts, fnChangePrice, fnAddProduct, formValidationDetail, sendFormDetail } = props;

  const { productCodeValid, qtyValid, priceValid } = formValidationDetail;

  return (
    <>
      <Form>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.title.addProduct">
              <Row>
                <Colxx xxs="12" xs="4" sm="3" md="3" lg="2">
                  <InputLabel label="page.invoicing.input.codeProduct" feedbackText={sendFormDetail && (productCodeValid || null)}>
                    <InputGroup size="sm">
                      <Input
                        bsSize="sm"
                        value={productCode}
                        id="productCode"
                        name="productCode"
                        type="text"
                        readOnly
                        onClick={fnViewProducts}
                        invalid={sendFormDetail && !!productCodeValid}
                        style={{ cursor: 'pointer', resize: 'none', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Button color="secondary" outline onClick={fnViewProducts} title={IntlMessages("page.invoicing.input.codeProduct")}>
                        <i className="bi bi-search" />
                      </Button>
                    </InputGroup>
                  </InputLabel>
                </Colxx>
                <Colxx xxs="12" xs="8" sm="6" md="6" lg="4">
                  <InputField
                    value={description}
                    name="description"
                    onChange={onInputDetaChange}
                    type="text"
                    disabled
                    label="page.invoicing.input.descriptionProd"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={unitProd}
                    name="unitProd"
                    onChange={onInputDetaChange}
                    type="text"
                    disabled
                    label="page.invoicing.input.unitProd"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={qty}
                    name="qty"
                    onChange={handleQtyChange}
                    type="text"
                    label="page.invoicing.input.qtyProd"
                    invalid={sendFormDetail && !!qtyValid}
                    feedbackText={sendFormDetail && (qtyValid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={price}
                    name="price"
                    onChange={handlePriceChange}
                    onClick={fnChangePrice}
                    type="text"
                    label="page.invoicing.input.priceProd"
                    readOnly
                    invalid={sendFormDetail && !!priceValid}
                    feedbackText={sendFormDetail && (priceValid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={subtotal}
                    name="subtotal"
                    onChange={onInputDetaChange}
                    type="text"
                    disabled
                    label="page.invoicing.input.subtotal"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={discountPercent}
                    name="discountPercent"
                    onChange={handleDiscPercentChange}
                    type="text"
                    label="page.invoicing.input.discPercent"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={discountValue}
                    name="discountValue"
                    onChange={onInputDetaChange}
                    type="text"
                    disabled
                    label="page.invoicing.input.discValue"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={taxPercent}
                    name="taxPercent"
                    onChange={handleTaxPercentChange}
                    type="text"
                    label="page.invoicing.input.taxPercent"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={taxValue}
                    name="taxValue"
                    onChange={onInputDetaChange}
                    type="text"
                    disabled
                    label="page.invoicing.input.taxValue"
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" md="3" lg="2">
                  <InputField
                    value={totalProd}
                    name="totalProd"
                    onChange={onInputDetaChange}
                    type="text"
                    disabled
                    label="page.invoicing.input.totalProd"
                  />
                </Colxx>
              </Row>
              <Row className="mb-1">
                <Colxx xxs="12" align="right">
                  <Button color="primary" onClick={() => { fnAddProduct() }}>
                    <i className='bi bi-plus' /> {IntlMessages("button.add")}
                  </Button>
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Form>
    </>
  );
}

export default InvoicingDetail;