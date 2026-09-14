import { useState } from 'react';
import { Button, Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { SimpleTable } from '@Components/SimpleTable';
import DateCalendar from '@Components/dateCalendar';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { usePurchaseOrders } from './usePurchaseOrders';
import { SimpleSelect } from '@Components/simpleSelect';

const Content = (props) => {
  const { setLoading, screenControl = {} } = props;
  const [activeTab, setActiveTab] = useState('1');

  const { propsToControlPanel, formState, formValidation, onInputChange, isFormValid, propsToMsgDelete, propsToMsgDeleteItem, columnDetails, dataDetails, fnAddItem, propsToModalSeekCustomers, propsToModalNewCustomer, propsToModalSeekProducts, propsToModalEditCurrentProduct, propsToModalSeekQuoteToLoad, sellerList, storeList, paymentTypeList, isDateEditable, sendForm, propsToModalSeekDocuments, propsToModalSendEmail, propsToViewPDF } = usePurchaseOrders({ setLoading, setActiveTab, screenControl });

  const { id, date, customerId, customerCode, customerName, phone, email, address, sellerId, storeId, paymentTypeId, notes, condDeliveryTime, condPaymentMethod, subtotal, discount, exoneratedValue, exemptValue, taxedValue, tax, total, isExonerated, numberExonerated } = formState;

  const { dateValid, sellerIdValid, paymentTypeIdValid, customerNameValid, phoneValid, totalValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs={12}>
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-3" />
              <Row>
                <Colxx xxs={12} md={8} lg={9}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Nav tabs className="separator-tabs ms-0 mb-0">
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: activeTab === '1',
                            'nav-link': true,
                          })}
                          onClick={() => setActiveTab('1')}
                        >
                          {IntlMessages("menu.billingPurchaseOrders")}
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: activeTab === '2',
                            'nav-link': true,
                          })}
                          onClick={() => setActiveTab('2')}
                        >
                          {IntlMessages("button.detail")}
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <span className="text-nowrap ms-3">
                      {IntlMessages('input.number')} <strong>{id || ''}</strong>
                    </span>
                  </div>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <Row className='mb-2'>
                        <Colxx xxs={12} md={4} lg={3}>
                          <DateCalendar
                            label="input.date"
                            name="date"
                            value={date}
                            onChange={onInputChange}
                            disabled={!isDateEditable}
                            invalid={sendForm && !!dateValid}
                            feedbackText={sendForm && (dateValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs={12} md={4} lg={4}>
                          <SimpleSelect
                            label="table.column.seller"
                            name="sellerId"
                            value={sellerId}
                            onChange={onInputChange}
                            options={sellerList}
                            invalid={sendForm && !!sellerIdValid}
                            feedbackText={sendForm && (sellerIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs={12} md={4} lg={5}>
                          <SimpleSelect
                            label="select.storeId"
                            name="storeId"
                            value={storeId}
                            onChange={onInputChange}
                            options={storeList}
                          />
                        </Colxx>
                      </Row>
                      <Row className='mb-2'>
                        <Colxx xxs={12} md={6} lg={5}>
                          <SimpleSelect
                            label="page.billingPurchaseOrders.select.paymentType"
                            name="paymentTypeId"
                            value={paymentTypeId}
                            onChange={onInputChange}
                            options={paymentTypeList}
                            invalid={sendForm && !!paymentTypeIdValid}
                            feedbackText={sendForm && (paymentTypeIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs={12} md={3}>
                          <Checkbox
                            label='page.billingPurchaseOrders.checkbox.exonerated'
                            name="isExonerated"
                            value={!!isExonerated}
                            onChange={onInputChange}
                          />
                        </Colxx>
                        <Colxx xxs={12} md={4}>
                          <InputField
                            label='page.billingPurchaseOrders.input.numberExonerated'
                            name="numberExonerated"
                            value={numberExonerated}
                            onChange={onInputChange}
                            disabled={!isExonerated}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs={12} md={7}>
                          <ContainerWithLabel label={"select.customer"}>
                            <Row>
                              <Colxx xxs={12} md={4} lg={5}>
                                <InputField
                                  label='page.common.input.id'
                                  name="customerId"
                                  value={customerId}
                                  onChange={onInputChange}
                                  disabled
                                />
                              </Colxx>
                              <Colxx xxs={12} md={8} lg={7}>
                                <InputField
                                  label='page.common.input.dni'
                                  name="customerCode"
                                  value={customerCode}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.common.input.name'
                                  name="customerName"
                                  value={customerName}
                                  onChange={onInputChange}
                                  invalid={sendForm && !!customerNameValid}
                                  feedbackText={sendForm && (customerNameValid || null)}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='input.phone'
                                  name="phone"
                                  value={phone}
                                  onChange={onInputChange}
                                  invalid={sendForm && !!phoneValid}
                                  feedbackText={sendForm && (phoneValid || null)}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='input.email'
                                  name="email"
                                  value={email}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='input.address'
                                  type='textarea'
                                  name="address"
                                  value={address}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                          </ContainerWithLabel>
                        </Colxx>
                        <Colxx xxs={12} md={5}>
                          <ContainerWithLabel label={"page.quotes.terms"}>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.quotes.terms.deliveryTimes'
                                  name="condDeliveryTime"
                                  value={condDeliveryTime}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.quotes.terms.paymentMethod'
                                  name="condPaymentMethod"
                                  value={condPaymentMethod}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.purchaseOrders.input.notes'
                                  type='textarea'
                                  name="notes"
                                  value={notes}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                          </ContainerWithLabel>
                        </Colxx>
                      </Row>
                    </TabPane>
                    <TabPane tabId="2">
                      <Row>
                        <Colxx xxs={12} className='text-end'>
                          <Button onClick={fnAddItem} className='btn btn-success'> <i className='bi bi-plus' /> {IntlMessages('button.add')} </Button>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs={12}>
                          <SimpleTable
                            columns={columnDetails}
                            data={dataDetails}
                          />
                        </Colxx>
                      </Row>
                    </TabPane>
                  </TabContent>
                </Colxx>
                <Colxx xxs={12} md={4} lg={3}>
                  <ContainerWithLabel label='page.common.label.totals'>
                    <Row>
                      <Colxx xxs={6} md={12}>
                        <InputField
                          label='input.subtotal'
                          name="subtotal"
                          value={formatNumber(subtotal, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                        />
                      </Colxx>
                      <Colxx xxs={6} md={12}>
                        <InputField
                          label='input.discount'
                          name="discount"
                          value={formatNumber(discount, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                        />
                        <InputField
                          label='input.exonerated'
                          name="exoneratedValue"
                          value={formatNumber(exoneratedValue, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                        />
                        <InputField
                          label='input.exent'
                          name="exemptValue"
                          value={formatNumber(exemptValue, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                        />
                        <InputField
                          label='input.taxed'
                          name="taxedValue"
                          value={formatNumber(taxedValue, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                        />
                        <InputField
                          label='input.tax'
                          name="tax"
                          value={formatNumber(tax, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                        />
                        <InputField
                          label='input.total'
                          name="total"
                          value={formatNumber(total, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-end'
                          invalid={sendForm && !!totalValid}
                          feedbackText={sendForm && (totalValid || null)}
                        />
                      </Colxx>
                    </Row>
                  </ContainerWithLabel>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalSeekDocuments} />
      <Modal {...propsToModalSeekQuoteToLoad} />
      <Modal {...propsToModalSeekCustomers} />
      <Modal {...propsToModalNewCustomer} />
      <Modal {...propsToModalSeekProducts} />
      <Modal {...propsToModalEditCurrentProduct} />
      <Modal {...propsToModalSendEmail} />
      <Modal {...propsToViewPDF} />
      <Confirmation {...propsToMsgDeleteItem} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Content;
