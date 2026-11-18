import { useState } from 'react';
import { Alert, Button, Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
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
import { SimpleSelect } from '@Components/simpleSelect';

const Content = (props) => {
  const { setLoading, screenControl = {}, canDelete = false } = props;
  const [activeTab, setActiveTab] = useState('1');
  // IntlMessages es un hook: se pide siempre arriba, nunca dentro de una condición.
  const lockedText = IntlMessages('page.quotes.msg.locked');

  const { propsToControlPanel, formState, errors, totals, isLocked, onInputChange, propsToMsgDelete, propsToMsgDeleteItem, columnDetails, dataDetails, fnAddItem, propsToModalSeekCustomers, propsToModalNewCustomer, propsToModalSeekProducts, propsToModalEditCurrentProduct, sellerList, storeList, sendForm, propsToModalSeekDocuments, propsToModalSendEmail } = useQuotes({ setLoading, setActiveTab, screenControl, canDelete });

  const { id, date, customerId, customerCode, customerName, customerPhone, customerEmail, customerAddress, sellerId, storeId, notes, deliveryTime, paymentTerms } = formState;
  const { subtotal, discountValue, exoneratedValue, exemptValue, taxedValue, taxValue, total } = totals;

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
                    {/* Siempre visible sin importar el tab activo — igual que "Número
                        Interno" en el POS/Facturación: en blanco mientras el documento
                        es nuevo, muestra el id apenas queda guardado. */}
                    <span className="text-nowrap ms-3">
                      {IntlMessages('input.number')} <strong>{id || ''}</strong>
                    </span>
                  </div>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      {isLocked && <Alert color="warning" className="mb-3">{lockedText}</Alert>}
                      <fieldset disabled={isLocked} className="border-0 p-0 m-0">
                      <Row className='mb-2'>
                        <Colxx xxs={12} md={4} lg={3}>
                          <DateCalendar
                            label="input.date"
                            name="date"
                            value={date}
                            onChange={onInputChange}
                            disabled={isLocked}
                            invalid={sendForm && !!errors.date}
                            feedbackText={sendForm && (errors.date || null)}
                          />
                        </Colxx>
                        <Colxx xxs={12} md={4} lg={4}>
                          <SimpleSelect
                            label="table.column.seller"
                            name="sellerId"
                            value={sellerId}
                            onChange={onInputChange}
                            options={sellerList}
                            invalid={sendForm && !!errors.sellerId}
                            feedbackText={sendForm && (errors.sellerId || null)}
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
                                  invalid={sendForm && !!errors.customerCode}
                                  feedbackText={sendForm && (errors.customerCode || null)}
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
                                  invalid={sendForm && !!errors.customerName}
                                  feedbackText={sendForm && (errors.customerName || null)}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='input.phone'
                                  name="customerPhone"
                                  value={customerPhone}
                                  onChange={onInputChange}
                                  invalid={sendForm && !!errors.customerPhone}
                                  feedbackText={sendForm && (errors.customerPhone || null)}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='input.email'
                                  name="customerEmail"
                                  value={customerEmail}
                                  invalid={sendForm && !!errors.customerEmail}
                                  feedbackText={sendForm && (errors.customerEmail || null)}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='input.address'
                                  type='textarea'
                                  name="customerAddress"
                                  value={customerAddress}
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
                                  name="deliveryTime"
                                  value={deliveryTime}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  label='page.quotes.terms.paymentMethod'
                                  name="paymentTerms"
                                  value={paymentTerms}
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
                      </fieldset>
                    </TabPane>
                    <TabPane tabId="2">
                      <Row>
                        <Colxx xxs={12} className='text-end'>
                          <Button onClick={fnAddItem} disabled={isLocked} className='btn btn-success'> <i className='bi bi-plus' /> {IntlMessages('button.add')} </Button>
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
                          name="discountValue"
                          value={formatNumber(discountValue, 'Lps. ', 2)}
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
                          name="taxValue"
                          value={formatNumber(taxValue, 'Lps. ', 2)}
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
      <Modal {...propsToModalSendEmail} />
      <Confirmation {...propsToMsgDeleteItem} />
      <Confirmation {...propsToMsgDelete} />
      {/* <Modal {} */}
    </>
  );
}
export default Content;