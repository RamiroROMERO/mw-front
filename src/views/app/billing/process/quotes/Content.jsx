import React, { useState } from 'react';
import { Button, Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { useQuotes } from './useQuotes';
import ControlPanel from '@/components/controlPanel';
import { formatNumber, IntlMessages } from '@/helpers/Utils';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { InputField } from '@/components/inputFields';
import { SimpleTable } from '@/components/SimpleTable';

const Content = (props) => {
  const { setLoading } = props;
  const [activeTab, setActiveTab] = useState('1');

  const { propsToControlPanel, formState, formValidation, onInputChange, isFormValid, table, propsToMsgDelete, columnDetails, dataDetails, fnAddItem } = useQuotes({ setLoading });

  const { customerId, customerCode, customerName, phone, email, address, sellerId, notes, condDeliveryTime, condPaymentMethod, subtotal, discount, exoneratedValue, exemptValue, taxedValue, tax, total } = formState;

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
                      <Row>
                        <Colxx xxs={12}>
                          <ContainerWithLabel label={"select.customer"}>
                            <Row>
                              <Colxx xxs={12} md={4} lg={2}>
                                <InputField
                                  label='page.common.input.id'
                                  name="customerId"
                                  value={customerId}
                                  onChange={onInputChange}
                                  disabled
                                />
                              </Colxx>
                              <Colxx xxs={12} md={8} lg={5}>
                                <InputField
                                  label='page.common.input.dni'
                                  name="customerCode"
                                  value={customerCode}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12} md={8} lg={7}>
                                <InputField
                                  label='page.common.input.name'
                                  name="customerName"
                                  value={customerName}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12} md={8} lg={7}>
                                <InputField
                                  label='input.phone'
                                  name="phone"
                                  value={phone}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12} md={8} lg={7}>
                                <InputField
                                  label='input.email'
                                  name="email"
                                  value={email}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12} md={8} lg={7}>
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
                      </Row>
                      <Row>
                        <Colxx xxs={12}>
                          <ContainerWithLabel label={"page.quotes.terms"}>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.quotes.terms.deliveryTimes'
                                  name="condDeliveryTime"
                                  valu={condDeliveryTime}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.quotes.terms.paymentMethod'
                                  name="condPaymentMethod"
                                  valu={condPaymentMethod}
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
    </>
  );
}
export default Content;