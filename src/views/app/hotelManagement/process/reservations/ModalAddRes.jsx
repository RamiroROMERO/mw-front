import { Colxx } from '@/components/common/CustomBootstrap'
import { formatDate, formatNumber, IntlMessages, validFloat } from '@/helpers/Utils';
import { Button, Label, ModalBody, ModalFooter, Row, Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import { useModalAddRes } from './useModalAddRes';
import DateCalendar from '@/components/dateCalendar';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { InputField } from '@/components/inputFields';
import Confirmation from '@Containers/ui/confirmationMsg'
import classnames from 'classnames';
import Modal from '@Components/modal';
import ModalAddService from './ModalAddService';
import ModalAddPayments from './ModalAddPayments';

const ModalAddRes = ({data, setOpen}) => {
  const {idRoom, currentRoom, currentReservation, currentPage, search, listCustomers, listStatusBooking, listStatusPayment, listServices, listPaymentTypes, setLoading, fnGetData, descriptionRoom} = data;

  const {rate, roomServices} = currentRoom;

  const {formState, formValidation, sendForm, customerEmail, customerPhone, currentPayment, currentService, dataServices, dataPayments, totalValServices, totalValPayments, activeTab, propsToMsgDeleteService, propsToMsgDeletePayment, openModalAddPayment, openModalAddService, setActiveTab, setOpenModalAddPayment, setOpenModalAddService, onInputChange, onCustomerChange, fnSave, fnSavePayment, fnSaveStatus, fnAddPayment, fnAddService, fnGetDataPayments, fnGetDataServices, fnDeleteService, fnDeletePayment } = useModalAddRes({currentReservation, setLoading, idRoom, currentPage, search, fnGetData, rate, setOpen});

  const {id, date, customerId, checkInDate, checkOutDate, statusId, totalNights, qtyAdults, qtyChild, others, notes, paymentStatusId} = formState;

  const {dateValid, customerIdValid} = formValidation;

  const propsToModalAddService = {
    ModalContent: ModalAddService,
    title: "page.hotel.modal.addService.title",
    valueTitle: descriptionRoom,
    open: openModalAddService,
    setOpen: setOpenModalAddService,
    maxWidth: 'sm',
    data: {
      bookingId: id,
      currentService,
      listServices,
      setLoading,
      fnGetDataServices
    }
  }

  const propsToModalAddPayment = {
    ModalContent: ModalAddPayments,
    title: "page.hotel.modal.addPayment.title",
    valueTitle: descriptionRoom,
    open: openModalAddPayment,
    setOpen: setOpenModalAddPayment,
    maxWidth: 'sm',
    data: {
      bookingId: id,
      currentPayment,
      listPaymentTypes,
      setLoading,
      fnGetDataPayments
    }
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <Nav tabs className="separator-tabs ml-0 mb-4">
            <NavItem>
              <NavLink
                className={classnames({
                  active: activeTab === '1',
                  'nav-link': true,
                })}
                onClick={() => setActiveTab('1')}
              >
                {IntlMessages("page.hotel.modal.reservation.title.generalData")}
              </NavLink>
            </NavItem>
            <NavItem style={{display: id===0?'none':'block'}}>
              <NavLink
                className={classnames({
                  active: activeTab === '2',
                  'nav-link': true,
                })}
                onClick={() => setActiveTab('2')}
              >
                {IntlMessages("page.hotel.modal.reservation.title.otherServices")}
              </NavLink>
            </NavItem>
            <NavItem style={{display: id===0?'none':'block'}}>
              <NavLink
                className={classnames({
                  active: activeTab === '3',
                  'nav-link': true,
                })}
                onClick={() => setActiveTab('3')}
              >
                {IntlMessages("page.hotel.modal.reservation.title.paymentSummary")}
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Row>
                <Colxx xxs={12} lg={8}>
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
                          <Colxx xxs={12} md={12} xl={5}>
                            <SearchSelect
                              label='select.customer'
                              name='customerId'
                              inputValue={customerId}
                              options={listCustomers}
                              onChange={onCustomerChange}
                              invalid={sendForm && !!customerIdValid}
                              feedbackText={sendForm && (customerIdValid || null)}
                            />
                          </Colxx>
                          <Colxx xxs={12} sm={6} md={6} xl={4}>
                            <InputField
                              name="customerEmail"
                              label='input.email'
                              value={customerEmail}
                              onChange={onInputChange}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={12} sm={6} md={6} xl={3}>
                            <InputField
                              name="customerPhone"
                              label='input.phone'
                              value={customerPhone}
                              onChange={onInputChange}
                              disabled
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={7} xl={6}>
                      <ContainerWithLabel label="page.hotel.modal.addReservations.label.detailRoom">
                        <Row>
                          <Colxx xxs={6} sm={6} lg={6}>
                            <InputField
                              name="nameRoom"
                              label='input.nameRoom'
                              value={currentRoom.name}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={6} lg={6}>
                            <InputField
                              name="typeId"
                              label='select.typeId'
                              value={currentRoom.typeName}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={4} md={6} lg={6}>
                            <InputField
                              name="bedNumber"
                              label='input.bedNumber'
                              value={currentRoom.bedNumber}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={4} md={6} lg={6}>
                            <InputField
                              name="rate"
                              label='input.rate'
                              value={formatNumber(currentRoom.rate, 'L.', 2)}
                              disabled
                            />
                          </Colxx>
                          <Colxx xs={6} sm={4} md={12} lg={6}>
                            <InputField
                              name='capacity'
                              label='input.capacity'
                              value={currentRoom.capacity}
                              onChange={onInputChange}
                              type='text'
                              disabled
                            />
                          </Colxx>
                          <Colxx xs={12} sm={12}>
                            <ContainerWithLabel label="page.hotel.modal.addRooms.label.services">
                              <Row>
                                {roomServices.map((element, idx) => {
                                  return(
                                    element.status===true?
                                    <Colxx xs={6} sm={4} md={6} key={idx}>
                                      <i className="bi bi-check2"></i>
                                      <Label>
                                        {element?.serviceData?.name || ""}
                                      </Label>
                                    </Colxx>
                                    :""
                                  )
                                })}
                              </Row>
                            </ContainerWithLabel>
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs={12} md={5} xl={6}>
                      <ContainerWithLabel label="page.hotel.modal.addReservations.label.detailBooking">
                        <Row>
                          <Colxx xxs={6} sm={6} md={12} lg={12} xl={6}>
                            <DateCalendar
                              name="checkInDate"
                              value={checkInDate}
                              label='select.checkInDate'
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={6} md={12} lg={12} xl={6}>
                            <DateCalendar
                              name="checkOutDate"
                              value={checkOutDate}
                              label='select.checkOutDate'
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={4} md={12} lg={12} xl={6}>
                            <InputField
                              name="totalNights"
                              label='input.totalNights'
                              value={totalNights}
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={4} md={12} lg={12} xl={6}>
                            <InputField
                              name="qtyAdults"
                              label='input.qtyAdults'
                              value={qtyAdults}
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={4} md={12} lg={12} xl={6}>
                            <InputField
                              name="qtyChild"
                              label='input.qtyChild'
                              value={qtyChild}
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={12}>
                            <InputField
                              name='notes'
                              label='input.notes'
                              value={notes}
                              onChange={onInputChange}
                              type='textarea'
                              style={{resize:'none'}}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs={12} lg={4}>
                  <Row>
                    <Colxx xxs={12} sm={6} lg={12}>
                      <ContainerWithLabel label="page.hotel.modal.addReservations.label.statusBooking">
                        <Row>
                          <Colxx xxs={12}>
                            <SearchSelect
                              label='select.status'
                              name='statusId'
                              inputValue={statusId}
                              options={listStatusBooking}
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={12} style={{ textAlign: 'right', display: id===0?'none':'block' }}>
                            <Button color="primary" onClick={fnSaveStatus}><i className="iconsminds-save" /> {IntlMessages("button.updateStatus")}</Button>
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12}>
                      <ContainerWithLabel label="page.hotel.modal.addReservations.label.statusPayment">
                        <Row>
                          <Colxx xxs={6} md={6} lg={12} xl={6}>
                            <InputField
                              name="totalValServices"
                              label='Total Costo'
                              value={formatNumber(totalValServices + validFloat(currentRoom.rate), 'L.', 2)}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={6} md={6} lg={12} xl={6}>
                            <InputField
                              name="totalValServices"
                              label='Total Pagado'
                              value={formatNumber(totalValPayments, 'L.', 2)}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={6} sm={12} md={6} lg={12} xl={6}>
                            <InputField
                              name="totalValServices"
                              label='Pago Pendiente'
                              value={formatNumber((totalValServices + validFloat(currentRoom.rate)) - totalValPayments, 'L.', 2)}
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs={12} md={6} lg={12} xl={6}>
                            <SearchSelect
                              label='select.status'
                              name='paymentStatusId'
                              inputValue={paymentStatusId}
                              options={listStatusPayment}
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={12} style={{ textAlign: 'right', display: id===0?'none':'block' }}>
                            <Button color="primary" onClick={fnSavePayment}><i className="iconsminds-save" /> {IntlMessages("button.updatePayment")}</Button>
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs={12}>
                      <ContainerWithLabel label="page.hotel.modal.addReservations.label.others">
                        <Row>
                          <Colxx xxs={12}>
                            <InputField
                              name='others'
                              label=''
                              value={others}
                              onChange={onInputChange}
                              type='textarea'
                              style={{resize:'none'}}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Colxx xxs={12} className="div-action-button-container mb-2" style={{height: 'fit-content'}}>
                  <Button color="primary" onClick={() => fnAddService() }>
                    <i className='bi bi-plus' />
                  </Button>
                </Colxx>
                <Colxx xxs={12}>
                  <Table bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th className='d-md-none-table-cell'>{IntlMessages("table.column.date")}</th>
                        <th>{IntlMessages("table.column.service")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.qty")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.price")}</th>
                        {/* <th className='d-xs-none-table-cell'>{IntlMessages("table.column.subtotal")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.taxPercent")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.tax")}</th> */}
                        <th>{IntlMessages("table.column.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataServices.map((item, idx) => {
                        return (
                          <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                            <th className='d-md-none-table-cell' scope="row">{formatDate(item.date)}</th>
                            <th scope="row">{item.service}</th>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.priceTotal)}</td>
                            {/* <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.subtotal)}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.taxPercent)}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.tax)}</td> */}
                            <td align='right'>{formatNumber(item.total)}</td>
                            <td align='right'>
                              <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                                onClick={() => { fnDeleteService(item) }} key={`buttons-${idx}`}>
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
                        <td align="right"><b>{totalValServices}</b></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </Colxx>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Row>
                <Colxx xxs={12} className="div-action-button-container mb-2" style={{height: 'fit-content'}}>
                  <Button color="primary" onClick={() => fnAddPayment() }>
                    <i className='bi bi-plus' />
                  </Button>
                </Colxx>
                <Colxx xxs={12}>
                  <Table bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th className='d-md-none-table-cell'>{IntlMessages("table.column.date")}</th>
                        <th>{IntlMessages("table.column.type")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.code")}</th>
                        <th>{IntlMessages("table.column.value")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataPayments.map((item, idx) => {
                        return (
                          <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                            <th className='d-md-none-table-cell' scope="row">{formatDate(item.date)}</th>
                            <th scope="row">{item.type}</th>
                            <td className='d-xs-none-table-cell' align='right'>{item.code}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.value)}</td>
                            <td align='right'>
                              <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                                onClick={() => { fnDeletePayment(item) }} key={`buttons-${idx}`}>
                                <i className='bi bi-trash' />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} align='right'><b>TOTAL</b></td>
                        <td align="right"><b>{totalValPayments}</b></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </Colxx>
              </Row>
            </TabPane>
          </TabContent>
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
    <Modal {...propsToModalAddService}/>
    <Modal {...propsToModalAddPayment}/>
    <Confirmation {...propsToMsgDeleteService}/>
    <Confirmation {...propsToMsgDeletePayment}/>
    </>
  )
}

export default ModalAddRes