import React, { useState } from 'react';
import { Button, Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { SimpleTable } from '@Components/SimpleTable';
import DateCalendar from '@Components/dateCalendar';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useQuotes } from './useQuotes';
import { SimpleSelect } from '@/components/simpleSelect';

const Content = (props) => {
  const { setLoading } = props;
  const [activeTab, setActiveTab] = useState('1');

  const { propsToControlPanel, formState, formValidation, onInputChange, isFormValid, propsToMsgDelete, propsToMsgDeleteItem, columnDetails, dataDetails, fnAddItem, propsToModalSeekCustomers, propsToModalNewCustomer, propsToModalSeekProducts, propsToModalEditCurrentProduct, sellerList, sendForm, propsToModalSeekDocuments } = useQuotes({ setLoading, setActiveTab });

  const { date, customerId, customerCode, customerName, phone, email, address, sellerId, notes, condDeliveryTime, condPaymentMethod, subtotal, discount, exoneratedValue, exemptValue, taxedValue, tax, total } = formState;

  const { dateValid, sellerIdValid, customerNameValid, totalValid } = formValidation;

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
                  <Nav tabs className="separator-tabs ml-0 mb-4">
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: activeTab === '1',
                          'nav-link': true,
                        })}
                        onClick={() => setActiveTab('1')}
                      >
                        {IntlMessages("menu.quotes")}
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
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <Row className='mb-2'>
                        <Colxx xxs={12} md={4} lg={3}>
                          <DateCalendar
                            label="input.date"
                            name="date"
                            value={date}
                            onChange={onInputChange}
                            invalid={sendForm && !!dateValid}
                            feedbackText={sendForm && (dateValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs={12} md={8} lg={9}>
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
                      {/* <Row>
                        
                      </Row> */}
                    </TabPane>
                    <TabPane tabId="2">
                      <Row>
                        <Colxx xxs={12} className='text-right'>
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
                          className='text-right'
                        />
                      </Colxx>
                      <Colxx xxs={6} md={12}>
                        <InputField
                          label='input.discount'
                          name="discount"
                          value={formatNumber(discount, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-right'
                        />
                        <InputField
                          label='input.exonerated'
                          name="exoneratedValue"
                          value={formatNumber(exoneratedValue, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-right'
                        />
                        <InputField
                          label='input.exent'
                          name="exemptValue"
                          value={formatNumber(exemptValue, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-right'
                        />
                        <InputField
                          label='input.taxed'
                          name="taxedValue"
                          value={formatNumber(taxedValue, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-right'
                        />
                        <InputField
                          label='input.tax'
                          name="tax"
                          value={formatNumber(tax, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-right'
                        />
                        <InputField
                          label='input.total'
                          name="total"
                          value={formatNumber(total, 'Lps. ', 2)}
                          onChange={onInputChange}
                          disabled
                          className='text-right'
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
      <Modal {...propsToModalSeekCustomers} />
      <Modal {...propsToModalNewCustomer} />
      <Modal {...propsToModalSeekProducts} />
      <Modal {...propsToModalEditCurrentProduct} />
      <Confirmation {...propsToMsgDeleteItem} />
      <Confirmation {...propsToMsgDelete} />
      {/* <Modal {} */}
    </>
  );
}
export default Content;