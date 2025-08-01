import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { Row } from 'reactstrap'
import DateCalendar from '@/components/dateCalendar'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { useOrderDetail } from './useOrderDetail'

const OrderDetail = ({formState, listCars, listDrivers, listStores, listProducts, onInputChange, onBulkForm, formValidation, sendForm}) => {

  const {date, qtyKM, orderNumber, machineId, plate, driverId, concept, storeId, productId, qtyGasDessel, qtyGasGasoline, qtyGasOil, qtyGasOthers} = formState;

  const {listFilterProducts, onStoreChange, onMachineChange} = useOrderDetail({onBulkForm, listProducts, listCars});

  const {dateValid, machineIdValid, driverIdValid, conceptValid} = formValidation;

  return (
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.fuelPurchases.title.orderDetail">
          <Row>
            <Colxx xxs="12" sm="9">
              <Row>
                <Colxx xxs="12" xs="8" lg="4">
                  <DateCalendar
                    name="date"
                    label="select.date"
                    value={date}
                    onChange={onInputChange}
                    invalid={sendForm && !!dateValid}
                    feedbackText={sendForm && (dateValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3">
                  <InputField
                    name="qtyKM"
                    label='input.kilometers'
                    value={qtyKM}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="8" lg="5">
                  <SearchSelect
                    label='select.carId'
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
                    label='select.driverId'
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
                    label='input.concept'
                    value={concept}
                    onChange={onInputChange}
                    type="text"
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
                    name='productId'
                    inputValue={productId}
                    options={listFilterProducts}
                    onChange={onInputChange}
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
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyGasDessel"
                    label='input.diesel'
                    value={qtyGasDessel}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyGasGasoline"
                    label='input.fuel'
                    value={qtyGasGasoline}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyGasOil"
                    label='input.oil'
                    value={qtyGasOil}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="12" xl="6">
                  <InputField
                    name="qtyGasOthers"
                    label='input.others'
                    value={qtyGasOthers}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
              </Row>
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}

export default OrderDetail