import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { Row } from 'reactstrap'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { useOrderDetail } from './useOrderDetail'

const OrderDetail = ({formState, listCars, listDrivers, listStores, listProducts, onInputChange, onBulkForm, formValidation, sendForm, processed}) => {

  const {date, kilometers, orderNumber, machineId, plate, driverId, concept, storeId, productCode, qtyDiesel, qtyGasoline, qtyOil, qtyOthers} = formState;

  const {listFilterProducts, onStoreChange, onMachineChange} = useOrderDetail({onBulkForm, listProducts, listCars});

  const {dateValid, machineIdValid, driverIdValid, conceptValid, kilometersValid, orderNumberValid, qtyDieselValid, qtyGasolineValid, qtyOilValid, qtyOthersValid, productCodeValid} = formValidation;

  return (
    <fieldset disabled={processed} className="border-0 p-0 m-0" style={{ minWidth: 0 }}>
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.fuelPurchases.title.orderDetail">
          <Row>
            <Colxx xxs="12" sm="9">
              <Row>
                <Colxx xxs="12" xs="8" lg="4">
                  <DateCalendar
                    name="date"
                    label="page.fuelPurchases.label.dateRequired"
                    value={date}
                    onChange={onInputChange}
                    invalid={sendForm && !!dateValid}
                    feedbackText={sendForm && (dateValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3">
                  <InputField
                    name="kilometers"
                    label='input.kilometers'
                    value={kilometers}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!kilometersValid}
                    feedbackText={sendForm && (kilometersValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8" lg="5">
                  <SearchSelect
                    label='page.fuelPurchases.label.carRequired'
                    name='machineId'
                    inputValue={machineId}
                    options={listCars}
                    onChange={onMachineChange}
                    invalid={sendForm && !!machineIdValid}
                    feedbackText={sendForm && (machineIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="4" xl="3">
                  <InputField
                    name="plate"
                    label='input.plate'
                    value={plate}
                    onChange={onInputChange}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="12" lg="8" xl="4">
                  <SearchSelect
                    label='page.fuelPurchases.label.driverRequired'
                    name='driverId'
                    inputValue={driverId}
                    options={listDrivers}
                    onChange={onInputChange}
                    invalid={sendForm && !!driverIdValid}
                    feedbackText={sendForm && (driverIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="12" lg="12" xl="5">
                  <InputField
                    name="concept"
                    label='page.fuelPurchases.label.conceptRequired'
                    value={concept}
                    onChange={onInputChange}
                    type="text"
                    maxLength={80}
                    invalid={sendForm && !!conceptValid}
                    feedbackText={sendForm && (conceptValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="12" lg="6">
                  <SearchSelect
                    label='select.storeId'
                    name='storeId'
                    inputValue={storeId}
                    options={listStores}
                    onChange={onStoreChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="12" lg="6">
                  <SearchSelect
                    label='select.productId'
                    name='productCode'
                    inputValue={productCode}
                    options={listFilterProducts}
                    onChange={onInputChange}
                    invalid={sendForm && !!productCodeValid}
                    feedbackText={sendForm && (productCodeValid || null)}
                  />
                </Colxx>
              </Row>
            </Colxx>
            <Colxx xxs="12" sm="3">
              <Row>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="orderNumber"
                    label='input.number'
                    value={orderNumber}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!orderNumberValid}
                    feedbackText={sendForm && (orderNumberValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyDiesel"
                    label='input.diesel'
                    value={qtyDiesel}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!qtyDieselValid}
                    feedbackText={sendForm && (qtyDieselValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyGasoline"
                    label='input.fuel'
                    value={qtyGasoline}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!qtyGasolineValid}
                    feedbackText={sendForm && (qtyGasolineValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyOil"
                    label='input.oil'
                    value={qtyOil}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!qtyOilValid}
                    feedbackText={sendForm && (qtyOilValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyOthers"
                    label='input.others'
                    value={qtyOthers}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!qtyOthersValid}
                    feedbackText={sendForm && (qtyOthersValid || null)}
                  />
                </Colxx>
              </Row>
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
    </fieldset>
  )
}

export default OrderDetail