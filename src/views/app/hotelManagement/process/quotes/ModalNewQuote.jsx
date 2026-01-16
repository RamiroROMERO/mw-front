import React from 'react'
import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap'
import { useModalNewQuote } from './useModalNewQuote'
import { formatNumber, IntlMessages } from '@/helpers/Utils';
import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { InputField } from '@/components/inputFields';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import Confirmation from '@/containers/ui/confirmationMsg';

const ModalNewQuote = ({data, setOpen}) => {
  const {currentItem, listCustomers, listRooms, setLoading, fnGetData, fnPrintPdf} = data;

  const {detailQuote, formState, formValidation, sendForm, onInputChange, onQtyNightChange, onQtyRoomsChange, onPriceLpsChange, onPriceUsdChange, onUsdChange, onDiscountPercentChange, onTaxPercentChange, onOtherTaxPercentChange, onCheckInDate, onCheckOutDate, formStateDeta, formValidationDeta, sendFormDeta, onInputChangeDeta, fnSave, fnAddDetail, fnEditDetail, fnDeleteDetail, propsToMsgDeleteDetail} = useModalNewQuote({currentItem, setLoading, fnGetData, listCustomers, listRooms, setOpen, fnPrintPdf});

  const {date, customerId, dni, name, phone, email, checkInDate, checkOutDate, subtotal, percentDiscount, discount, percentTax1, valueTax1, percentTax2, valueTax2, total, usdChange } = formState;

  const {roomId, qtyNight, qtyRooms, priceUsd, priceLps, subtotalUsd, subtotalLps } = formStateDeta;

  const {dateValid, nameValid, checkInDateValid, checkOutDateValid} = formValidation;

  const {roomIdValid, qtyNightValid, qtyRoomsValid} = formValidationDeta;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} sm={5} lg={4}>
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="page.hotel.modal.addReservations.label.detailCustomer">
              <Row>
                <Colxx xxs={12} md={12} xl={8}>
                  <SearchSelect
                    label='select.customer'
                    name='customerId'
                    inputValue={customerId}
                    options={listCustomers}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6} md={6} xl={4}>
                  <InputField
                    name="dni"
                    label='input.dni'
                    value={dni}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6} md={6} xl={4}>
                  <InputField
                    name="name"
                    label='input.name'
                    value={name}
                    onChange={onInputChange}
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6} md={6} xl={4}>
                  <InputField
                    name="email"
                    label='input.email'
                    value={email}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6} md={6} xl={4}>
                  <InputField
                    name="phone"
                    label='input.phone'
                    value={phone}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="page.hotel.modal.addReservations.label.detailBooking">
              <Row>
                <Colxx xxs={6} sm={6} md={6} lg={4} xl={3}>
                  <DateCalendar
                    name="checkInDate"
                    value={checkInDate}
                    label='select.checkInDate'
                    onChange={onCheckInDate}
                    invalid={sendForm && !!checkInDateValid}
                    feedbackText={sendForm && (checkInDateValid || null)}
                  />
                </Colxx>
                <Colxx xxs={6} sm={6} md={6} lg={4} xl={3}>
                  <DateCalendar
                    name="checkOutDate"
                    value={checkOutDate}
                    label='select.checkOutDate'
                    onChange={onCheckOutDate}
                    invalid={sendForm && !!checkOutDateValid}
                    feedbackText={sendForm && (checkOutDateValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12} md={6} xl={4}>
                  <SearchSelect
                    label='select.roomId'
                    name='roomId'
                    inputValue={roomId}
                    options={listRooms}
                    onChange={onInputChangeDeta}
                    invalid={sendFormDeta && !!roomIdValid}
                    feedbackText={sendFormDeta && (roomIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="qtyNight"
                    label='input.totalNights'
                    value={qtyNight}
                    onChange={onQtyNightChange}
                    invalid={sendFormDeta && !!qtyNightValid}
                    feedbackText={sendFormDeta && (qtyNightValid || null)}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="qtyRooms"
                    label='input.qtyRooms'
                    value={qtyRooms}
                    onChange={onQtyRoomsChange}
                    invalid={sendFormDeta && !!qtyRoomsValid}
                    feedbackText={sendFormDeta && (qtyRoomsValid || null)}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="priceLps"
                    label='input.priceLps'
                    value={priceLps}
                    onChange={onPriceLpsChange}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="subtotalLps"
                    label='input.subtotalLps'
                    value={subtotalLps}
                    onChange={onInputChangeDeta}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="usdChange"
                    label='input.exchangeRate'
                    value={usdChange}
                    onChange={onUsdChange}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="priceUsd"
                    label='input.priceUsd'
                    value={formatNumber(priceUsd, '', 2)}
                    onChange={onPriceUsdChange}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="subtotalUsd"
                    label='input.subtotalUsd'
                    value={formatNumber(subtotalUsd, '', 2)}
                    onChange={onInputChangeDeta}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={8} md={12} lg={9} xl={6} align="right">
                  <Button type="button" className="btn-circle-table" color="outline-primary" title="New"
                    onClick={fnAddDetail}>
                    <i className='bi bi-plus' />
                  </Button>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12}>
                  <Table bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th className='d-md-none-table-cell'>{IntlMessages("table.column.room")}</th>
                        <th>{IntlMessages("table.column.qtyNight")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.qtyRooms")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.priceLps")}</th>
                        <th>{IntlMessages("table.column.subtotalLps")}</th>
                        <th>{IntlMessages("table.column.options")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailQuote.map((item, idx) => {
                        return (
                          <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                            <th className='d-md-none-table-cell' scope="row">{item.roomName}</th>
                            <th scope="row">{item.qtyNight}</th>
                            <td className='d-xs-none-table-cell' align='right'>{item.qtyRooms}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.priceLps)}</td>
                            <td align='right'>{formatNumber(item.subtotalLps)}</td>
                            <td align='right'>
                              <Button type="button" className="btn-circle-table" color="outline-warning" title="Editar"
                                onClick={() => { fnEditDetail(item) }} key={`buttons-${idx}`}>
                                <i className='bi bi-pencil' />
                              </Button>
                              <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                                onClick={() => { fnDeleteDetail(item) }} key={`buttons2-${idx}`}>
                                <i className='bi bi-trash' />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} align='right'><b>TOTAL</b></td>
                        <td align="right"><b>{formatNumber(total, 'L. ', 2)}</b></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="page.hotel.modal.addReservations.label.totals">
              <Row>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="subtotal"
                    label='input.subtotal'
                    value={formatNumber(subtotal, '', 2)}
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="percentDiscount"
                    label='input.discountPercent'
                    value={percentDiscount}
                    onChange={onDiscountPercentChange}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="discount"
                    label='input.discountValue'
                    value={formatNumber(discount, '', 2)}
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="percentTax1"
                    label='input.taxPercent'
                    value={percentTax1}
                    onChange={onTaxPercentChange}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="valueTax1"
                    label='input.taxValue'
                    value={formatNumber(valueTax1, '', 2)}
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="percentTax2"
                    label='input.otherTaxPercent'
                    value={percentTax2}
                    onChange={onOtherTaxPercentChange}
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="valueTax2"
                    label='input.otherTaxValue'
                    value={formatNumber(valueTax2, '', 2)}
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={4} md={6} lg={3} xl={2}>
                  <InputField
                    name="total"
                    label='input.total'
                    value={formatNumber(total, '', 2)}
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
      </ModalFooter>
      <Confirmation {...propsToMsgDeleteDetail}/>
    </>
  )
}

export default ModalNewQuote