import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useModalStockControl } from './useModalStockControl';

const ModalStockControl = ({ data, setOpen }) => {

  const { productCode, productName, listProviders, product, setBulkForm } = data;

  const { formState, onInputChange, fnFrequencyBlur, fnSave, fnCancel } = useModalStockControl({
    setLoading: data.setLoading,
    productId: data.productId,
    product,
    setBulkForm,
    setOpen
  });

  const { season, frequency, productionTime, providerId, minQtyHigh, percentBadHandlingHigh, percentMaxBadHandlingHigh,
    minQtyLow, percentBadHandlingLow, percentMaxBadHandlingLow } = formState;

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
          <Colxx xxs={12} md={4}>
            <RadioGroup
              label="page.productsCatalog.modal.stockControl.select.season"
              name="season"
              value={season}
              onChange={onInputChange}
              options={[
                { id: 1, label: "page.productsCatalog.modal.stockControl.radio.seasonHigh" },
                { id: 2, label: "page.productsCatalog.modal.stockControl.radio.seasonLow" }
              ]}
            />
          </Colxx>
          <Colxx xxs={12} md={8}>
            <SearchSelect
              label="page.productsCatalog.modal.stockControl.select.provider"
              name="providerId"
              inputValue={providerId}
              options={listProviders}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} md={6}>
            <InputField
              label="page.productsCatalog.modal.stockControl.input.frequency"
              name="frequency"
              type="number"
              value={frequency}
              onChange={onInputChange}
              onBlur={fnFrequencyBlur}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label="page.productsCatalog.modal.stockControl.input.productionTime"
              name="productionTime"
              type="number"
              value={productionTime}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} lg={6}>
            <ContainerWithLabel label="page.productsCatalog.modal.stockControl.title.seasonHigh">
              <Row>
                <Colxx xxs={12} sm={4}>
                  <InputField
                    label="page.productsCatalog.modal.stockControl.input.minQty"
                    name="minQtyHigh"
                    type="number"
                    value={minQtyHigh}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={4}>
                  <InputField
                    label="page.productsCatalog.modal.stockControl.input.percentBadHandling"
                    name="percentBadHandlingHigh"
                    type="number"
                    value={percentBadHandlingHigh}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={4}>
                  <InputField
                    label="page.productsCatalog.modal.stockControl.input.percentMaxBadHandling"
                    name="percentMaxBadHandlingHigh"
                    type="number"
                    value={percentMaxBadHandlingHigh}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} lg={6}>
            <ContainerWithLabel label="page.productsCatalog.modal.stockControl.title.seasonLow">
              <Row>
                <Colxx xxs={12} sm={4}>
                  <InputField
                    label="page.productsCatalog.modal.stockControl.input.minQty"
                    name="minQtyLow"
                    type="number"
                    value={minQtyLow}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={4}>
                  <InputField
                    label="page.productsCatalog.modal.stockControl.input.percentBadHandling"
                    name="percentBadHandlingLow"
                    type="number"
                    value={percentBadHandlingLow}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={4}>
                  <InputField
                    label="page.productsCatalog.modal.stockControl.input.percentMaxBadHandling"
                    name="percentMaxBadHandlingLow"
                    type="number"
                    value={percentMaxBadHandlingLow}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} className="div-action-button-container">
            <Button color="secondary" onClick={fnCancel}><i className="bi bi-box-arrow-right"></i> {` ${IntlMessages('button.cancel')}`}</Button>
            <Button color="primary" onClick={fnSave}><i className="iconsminds-save"></i> {` ${IntlMessages('button.save')}`}</Button>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </>
  )
}

export default ModalStockControl;
