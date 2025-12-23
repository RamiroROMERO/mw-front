import { Colxx } from '@/components/common/CustomBootstrap'
import { formatDate, formatNumber, IntlMessages, validFloat } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { useModalInvoice } from './useModalInvoice'
import TextTitle from '@/components/textTitle/TextTitle'
import Modal from '@Components/modal';
import ModalGenerateInvoice from './ModalGenerateInvoice'
import { SimpleSelect } from '@/components/simpleSelect'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { InputField } from '@/components/inputFields'
import { RadioGroup } from '@/components/radioGroup'
import DateCalendar from '@/components/dateCalendar'
import { Checkbox } from '@/components/checkbox'

const ModalInvoice = ({data, setOpen}) => {
  const {dataBooking, setLoading} = data;

  const bookingId = dataBooking.id;
  const baseRate = dataBooking?.baseRate || 0;
  const creditDays = dataBooking?.customerData?.creditDays || 0;
  const roomId = dataBooking?.roomId || 0;

  const {totalValPayments, totalValServices, listTypePayments, listCashBoxes, listCashiers, listTypeDocuments, openModalGenerateInvoice, formState, formValidation, sendForm, onInputChange, onPriceChange, onDiscountPercentChange, onDiscountValueChange, onTaxPercentChange, onTaxValueChange, onOtherTaxPercentChange, onOtherTaxValueChange, setOpenModalGenerateInvoice, setListTypePayments, dataPayments, dataServices, fnSave} = useModalInvoice({bookingId, baseRate, creditDays, roomId, setLoading, setOpen});

  const { invoiceDate, documentCode, cashId, cashierId, documentType, billingToCompany, price, subtotal, discountPercent, discountValue, taxPercent, taxValue, otherTaxPercent, otherTaxValue, total } = formState;

  const { documentCodeValid, documentTypeValid } = formValidation;

  const propsToModalGenerateInvoice = {
    ModalContent: ModalGenerateInvoice,
    title: "page.hotel.modal.invoice.paymentDetail.title",
    open: openModalGenerateInvoice,
    setOpen: setOpenModalGenerateInvoice,
    maxWidth: 'md',
    data: {
      bookingId,
      dataInvoice: formState,
      creditDays,
      subtotal,
      roomId,
      billingToCompany,
      totalValServices,
      totalValPayments,
      listTypePayments,
      setListTypePayments,
      setLoading
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} xl={7}>
            <Row>
              <Colxx xxs={12} sm={4} lg={3}>
                <TextTitle
                  title='select.date'
                  subTitle={formatDate(dataBooking.date)}
                />
              </Colxx>
              <Colxx xxs={12} sm={6} lg={5}>
                <TextTitle
                  title='select.customer'
                  subTitle={dataBooking?.customerData?.name || ""}
                />
              </Colxx>
              <Colxx xxs={12} sm={4} lg={3}>
                <TextTitle
                  title='select.roomId'
                  subTitle={dataBooking?.roomData?.name || ""}
                />
              </Colxx>
              <Colxx xxs={12} sm={4} lg={4}>
                <TextTitle
                  title='select.checkInDate'
                  subTitle={dataBooking?.checkInDate}
                />
              </Colxx>
              <Colxx xxs={12} sm={4} lg={4}>
                <TextTitle
                  title='select.checkOutDate'
                  subTitle={dataBooking?.checkOutDate}
                />
              </Colxx>
            </Row>
            <Row className='mt-3'>
              <Colxx xxs={12}>
                <ContainerWithLabel label="page.hotel.modal.reservation.title.otherServices">
                  <Row>
                    <Colxx xxs={12}>
                      <Table bordered hover size='sm'>
                        <thead>
                          <tr>
                            <th className='d-md-none-table-cell'>{IntlMessages("table.column.date")}</th>
                            <th>{IntlMessages("table.column.service")}</th>
                            <th className='d-xs-none-table-cell'>{IntlMessages("table.column.qty")}</th>
                            <th className='d-xs-none-table-cell'>{IntlMessages("table.column.price")}</th>
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
                                <td align='right'>{formatNumber(item.total)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className='d-md-none-table-cell'></td>
                            <td className='d-xs-none-table-cell'></td>
                            <td className='d-xs-none-table-cell'></td>
                            <td align='right'><b>TOTAL</b></td>
                            <td align="right"><b>{totalValServices}</b></td>
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
                <ContainerWithLabel label="page.hotel.modal.reservation.title.paymentSummary">
                  <Row>
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
                                <td align='right'>{formatNumber(item.value)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className='d-md-none-table-cell'></td>
                            <td className='d-xs-none-table-cell'></td>
                            <td align='right'><b>TOTAL</b></td>
                            <td align="right"><b>{totalValPayments}</b></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs={12} xl={5}>
            <Row>
              <Colxx xxs={12}>
                <ContainerWithLabel label="page.hotel.modal.addReservations.label.statusPayment">
                  <Row>
                    <Colxx xxs={6} md={6} lg={3} xl={6}>
                      <TextTitle
                        title='input.totalCost'
                        subTitle={formatNumber(totalValServices + validFloat(dataBooking?.baseRate || 0), 'L.', 2)}
                      />
                    </Colxx>
                    <Colxx xxs={6} md={6} lg={3} xl={6}>
                      <TextTitle
                        title='input.totalPaid'
                        subTitle={formatNumber(totalValPayments, 'L.', 2)}
                      />
                    </Colxx>
                    <Colxx xxs={6} md={6} lg={3} xl={6}>
                      <TextTitle
                        title='input.pendingPayment'
                        subTitle={formatNumber((totalValServices + validFloat(dataBooking?.baseRate || 0)) - totalValPayments, 'L.', 2)}
                      />
                    </Colxx>
                    <Colxx xxs={6} md={6} lg={3} xl={6}>
                      <TextTitle
                        title='select.status'
                        subTitle={dataBooking?.payStatusData?.name || ""}
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
              <Colxx xxs={12}>
                <ContainerWithLabel label="page.hotel.modal.addReservations.label.invoiceDetail">
                  <Row>
                    <Colxx xxs={6} lg={4} xl={6}>
                      <DateCalendar
                        name="invoiceDate"
                        value={invoiceDate}
                        label='select.date'
                        onChange={onInputChange}
                      />
                    </Colxx>
                    <Colxx xxs={6} lg={4} xl={6}>
                      <RadioGroup
                        display='flex'
                        label="page.invoicing.title.salesType"
                        name="documentType"
                        value={documentType}
                        onChange={onInputChange}
                        options={
                          [
                            { id: 1, label: "page.invoicing.radio.cash" },
                            { id: 2, label: "page.invoicing.radio.credit" }
                          ]
                        }
                        invalid={sendForm && !!documentTypeValid}
                        feedbackText={sendForm && (documentTypeValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={6} lg={4} xl={6}>
                      <SimpleSelect
                        name="documentCode"
                        label="page.invoicing.select.typeDocument"
                        value={documentCode}
                        onChange={onInputChange}
                        options={listTypeDocuments}
                        invalid={sendForm && !!documentCodeValid}
                        feedbackText={sendForm && (documentCodeValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={6} lg={6} xl={6}>
                      <SearchSelect
                        label='page.hotel.select.cashierId'
                        name='cashierId'
                        inputValue={cashierId}
                        onChange={onInputChange}
                        options={listCashiers}
                      />
                    </Colxx>
                    <Colxx xxs={6} lg={6} xl={6}>
                      <SearchSelect
                        label='select.cashId'
                        name='cashId'
                        inputValue={cashId}
                        onChange={onInputChange}
                        options={listCashBoxes}
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="price"
                        label="input.price"
                        value={price}
                        onChange={onPriceChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="discountPercent"
                        label="input.discountPercent"
                        value={discountPercent}
                        onChange={onDiscountPercentChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="discountValue"
                        label="input.discountValue"
                        value={discountValue}
                        onChange={onDiscountValueChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="taxPercent"
                        label="input.taxPercent"
                        value={taxPercent}
                        onChange={onTaxPercentChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="taxValue"
                        label="input.taxValue"
                        value={taxValue}
                        onChange={onTaxValueChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="otherTaxPercent"
                        label="input.otherTaxPercent"
                        value={otherTaxPercent}
                        onChange={onOtherTaxPercentChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="otherTaxValue"
                        label="input.otherTaxValue"
                        value={otherTaxValue}
                        onChange={onOtherTaxValueChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs={6} md={3} xl={6}>
                      <InputField
                        name="total"
                        label="input.total"
                        value={total}
                        onChange={onInputChange}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs={6} md={6} xl={6}>
                      <Checkbox
                        onChange={onInputChange}
                        name="billingToCompany"
                        value={billingToCompany}
                        label="check.billingToCompany"
                      />
                    </Colxx>
                    <Colxx xxs={12} style={{textAlign: 'right'}}>
                      <Button color="primary" onClick={fnSave}><i className="bi bi-receipt" /> {IntlMessages("button.generateInvoice")}</Button>
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalGenerateInvoice}/>
    </>
  )
}

export default ModalInvoice