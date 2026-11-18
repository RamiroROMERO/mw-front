import { useState } from 'react';
import { Row, Card, CardBody, FormGroup, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from '@Components/simpleSelect';
import { RadioGroup } from '@Components/radioGroup';
import { Checkbox } from '@Components/checkbox';
import { InputField } from '@Components/inputFields';
import { ContainerWithLabel } from '@Components/containerWithLabel';

import classnames from 'classnames';
import ControlPanel from '@Components/controlPanel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalViewCust from './ModalViewCust';
import { useCustomers } from './useCustomers';

const Customers = (props) => {

  const { setLoading } = props;
  const [activeTab, setActiveTab] = useState('1');

  const { formState,
    setOpenModalViewCust,
    listLedgerAccounts,
    listTypeCustomers,
    dataCustomers,
    sendForm,
    propsToControlPanel,
    openModalViewCust,
    isFarmControl,
    isHospital, fnViewCustomer, fnLookupRtn, onInputChange, listDepartments, listMunicipalities, onDeptoChange, onTypeChange, errors, propsToMsgDelete, listSellers } = useCustomers({ setLoading });

  const { rtn, nomcli, entryDate, tel, phone2, direcc, customerTypeId, locationType, sellerId, creditRequest, creditDays, creditLimit, paymentTerms, globalDiscount, memberLimit, isInternational,
    isPartner, paysTax, isDefaultPos, purchaseContactName, purchaseContactPosition, purchaseContactPhone, purchaseContactMobile, purchaseContactEmail, paymentContactName,
    paymentContactPosition, paymentContactPhone, paymentContactMobile, paymentContactEmail, receivableCtaCode, discountCtaCode, taxCtaCode, freightCtaCode, bonusCtaCode, weeklyPeriod,
    monthlyPeriod, biweeklyPeriod, quarterlyPeriod, status, isProducer, isCertifiedProducer, exonerationNumber, isDefaultInsurer, kind, isOutsourcingBill, deptoCode, municCode } = formState;

  const propsToModalViewCust = {
    ModalContent: ModalViewCust,
    title: "page.customers.modal.modalViewCust.title",
    open: openModalViewCust,
    setOpen: setOpenModalViewCust,
    maxWidth: 'lg',
    data: {
      dataCustomers,
      fnViewItem: fnViewCustomer
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-3" />
              <Nav tabs className="separator-tabs ms-0 mb-4">
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '1',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('1')}
                  >
                    {IntlMessages("page.customers.modal.modalNew.title.generalData")}
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
                    {IntlMessages("page.customers.modal.modalNew.title.contacts")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '3',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('3')}
                  >
                    {IntlMessages("page.customers.modal.modalNew.title.ledgerAccounts")}
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <Row>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="5">
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <SimpleSelect
                            label="page.customers.modal.modalNew.select.typeCustomer"
                            name="customerTypeId"
                            value={customerTypeId}
                            onChange={onTypeChange}
                            options={listTypeCustomers}
                            invalid={sendForm && !!errors.customerTypeId}
                            feedbackText={sendForm && (errors.customerTypeId || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={rtn}
                            name="rtn"
                            onChange={onInputChange}
                            onBlur={fnLookupRtn}
                            maxLength={20}
                            type="text"
                            label="page.customers.modal.modalNew.input.dni"
                            invalid={sendForm && !!errors.rtn}
                            feedbackText={sendForm && (errors.rtn || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={nomcli}
                            name="nomcli"
                            onChange={onInputChange}
                            type="text"
                            maxLength={120}
                            label="page.customers.modal.modalNew.input.name"
                            invalid={sendForm && !!errors.nomcli}
                            feedbackText={sendForm && (errors.nomcli || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <DateCalendar
                            value={entryDate}
                            label="page.customers.modal.modalNew.input.dateAdmission"
                            name="entryDate"
                            maxDate={new Date()}
                            onChange={onInputChange}
                            invalid={sendForm && !!errors.entryDate}
                            feedbackText={sendForm && (errors.entryDate || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={tel}
                            name="tel"
                            onChange={onInputChange}
                            type="text"
                            maxLength={60}
                            label="page.customers.modal.modalNew.input.phone"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={phone2}
                            name="phone2"
                            onChange={onInputChange}
                            type="text"
                            maxLength={45}
                            label="page.customers.modal.modalNew.input.phone2"
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <ContainerWithLabel label="page.customers.modal.modalNew.input.address">
                            <Row>
                              <Colxx xxs="12" md={6} lg={12}>
                                <SimpleSelect
                                  label="select.department"
                                  name="deptoCode"
                                  value={deptoCode}
                                  onChange={onDeptoChange}
                                  options={listDepartments}
                                  invalid={sendForm && !!errors.deptoCode}
                                  feedbackText={sendForm && (errors.deptoCode || null)}
                                />
                              </Colxx>
                              <Colxx xxs="12" md={6} lg={12}>
                                <SimpleSelect
                                  label="select.municipality"
                                  name="municCode"
                                  value={municCode}
                                  onChange={onInputChange}
                                  options={listMunicipalities}
                                  invalid={sendForm && !!errors.municCode}
                                  feedbackText={sendForm && (errors.municCode || null)}
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs={12}>
                                <InputField
                                  value={direcc}
                                  name="direcc"
                                  onChange={onInputChange}
                                  type="textarea"
                                  label="label.title.exactAddress"
                                />
                              </Colxx>
                            </Row>
                          </ContainerWithLabel>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <RadioGroup
                            label="page.customers.modal.modalNew.label.typeCustomer"
                            name="locationType"
                            value={locationType}
                            onChange={onInputChange}
                            options={[
                              { id: 1, label: 'page.customers.modal.modalNew.radio.custLocal' },
                              { id: 2, label: 'page.customers.modal.modalNew.radio.custForeigner' },
                              { id: 3, label: 'page.customers.modal.modalNew.radio.custInter' }
                            ]}
                            display='flex'
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={exonerationNumber}
                            name="exonerationNumber"
                            onChange={onInputChange}
                            maxLength={50}
                            label="page.customers.modal.modalNew.input.exoneratedNumber"
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <SimpleSelect
                            label="table.column.seller"
                            name="sellerId"
                            value={sellerId}
                            onChange={onInputChange}
                            options={listSellers}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={globalDiscount}
                            name="globalDiscount"
                            onChange={onInputChange}
                            type="number"
                            label="page.customers.modal.modalNew.input.globalDiscount"
                            invalid={sendForm && !!errors.globalDiscount}
                            feedbackText={sendForm && (errors.globalDiscount || null)}
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="7">
                      <ContainerWithLabel label="page.customers.modal.modalNew.title.creditStatus">
                        <Row>
                          <Colxx xxs="12" sm="5">
                            <RadioGroup
                              label="page.customers.modal.modalNew.input.creditRequest"
                              name="creditRequest"
                              value={creditRequest}
                              onChange={onInputChange}
                              options={[
                                { id: 1, label: 'page.customers.modal.modalNew.input.creditRequest.yes' },
                                { id: 2, label: 'page.customers.modal.modalNew.input.creditRequest.no' }
                              ]}
                              display='flex'
                              invalid={sendForm && !!errors.creditRequest}
                              feedbackText={sendForm && (errors.creditRequest || null)}
                            />
                          </Colxx>
                          <Colxx xxs="6" sm="3">
                            <InputField
                              value={creditDays}
                              name="creditDays"
                              onChange={onInputChange}
                              type="number"
                              label="page.customers.modal.modalNew.input.creditDays"
                              invalid={sendForm && !!errors.creditDays}
                              feedbackText={sendForm && (errors.creditDays || null)}
                            />
                          </Colxx>
                          <Colxx xxs="6" sm="4">
                            <InputField
                              value={creditLimit}
                              name="creditLimit"
                              onChange={onInputChange}
                              type="number"
                              label="page.customers.modal.modalNew.input.creditLimit"
                              invalid={sendForm && !!errors.creditLimit}
                              feedbackText={sendForm && (errors.creditLimit || null)}
                            />
                          </Colxx>
                          <Colxx xxs="12">
                            <ContainerWithLabel label="page.customers.modal.modalNew.label.purchasePeriod">
                              <Row>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="weeklyPeriod"
                                    value={weeklyPeriod}
                                    label="page.customers.modal.modalNew.check.weekly"
                                  />
                                </Colxx>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="monthlyPeriod"
                                    value={monthlyPeriod}
                                    label="page.customers.modal.modalNew.check.monthly"
                                  />
                                </Colxx>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="biweeklyPeriod"
                                    value={biweeklyPeriod}
                                    label="page.customers.modal.modalNew.check.biweekly"
                                  />
                                </Colxx>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="quarterlyPeriod"
                                    value={quarterlyPeriod}
                                    label="page.customers.modal.modalNew.check.quarterly"
                                  />
                                </Colxx>
                              </Row>
                            </ContainerWithLabel>
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12">
                            <InputField
                              value={paymentTerms}
                              name="paymentTerms"
                              onChange={onInputChange}
                              type="textarea"
                              label="page.customers.modal.modalNew.input.paymentTerms"
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                      <Row>
                        <Colxx xxs="12">
                          <FormGroup>
                            <Row>
                              <Colxx xxs="5">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="isInternational"
                                  value={isInternational}
                                  label="page.customers.modal.modalNew.check.international"
                                />
                              </Colxx>
                              <Colxx xxs="7">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="isPartner"
                                  value={isPartner}
                                  label="page.customers.modal.modalNew.check.wholesaleCustomer"
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs="5">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="paysTax"
                                  value={paysTax}
                                  label="page.customers.modal.modalNew.ckeck.payIVA"
                                />
                              </Colxx>
                              <Colxx xxs="7">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="isDefaultPos"
                                  value={isDefaultPos}
                                  label="page.customers.modal.modalNew.check.defaultPOS"
                                />
                              </Colxx>
                            </Row>
                            {isFarmControl && (
                              <Row>
                                <Colxx xxs="6">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="isProducer"
                                    value={isProducer}
                                    label="page.customers.modal.modalNew.ckeck.isProducer"
                                  />
                                </Colxx>
                                <Colxx xxs="6">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="isCertifiedProducer"
                                    value={isCertifiedProducer}
                                    label="page.customers.modal.modalNew.check.productorCert"
                                  />
                                </Colxx>
                              </Row>
                            )}
                            <Row>
                              <Colxx xxs="5">
                                <Checkbox
                                  label="page.customers.checkbox.billOuts"
                                  name="isOutsourcingBill"
                                  value={isOutsourcingBill}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                              <Colxx xxs="7">
                                <Checkbox
                                  label="page.productsTypes.check.status"
                                  name="status"
                                  value={status}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                          </FormGroup>
                          <hr />
                          {isHospital && (
                            <Row>
                              <Colxx xxs={12} md={6}>
                                <RadioGroup
                                  label="page.customers.input.patientType"
                                  value={kind}
                                  name="kind"
                                  onChange={onInputChange}
                                  options={
                                    [
                                      { id: 1, label: "page.customers.input.patientType.type1" },
                                      { id: 2, label: "page.customers.input.patientType.type2" }
                                    ]
                                  }
                                />
                              </Colxx>
                              <Colxx xxs={12} md={6}>
                                <InputField
                                  value={memberLimit}
                                  name="memberLimit"
                                  onChange={onInputChange}
                                  type="number"
                                  label="page.customers.input.memberLimit"
                                />
                                <Checkbox
                                  label="page.customers.checkbox.defaSecurityHosp"
                                  name="isDefaultInsurer"
                                  value={isDefaultInsurer}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                          )}
                        </Colxx>
                      </Row>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="2">
                  <Row>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="6">
                      <ContainerWithLabel label="page.customers.modal.modalNew.title.purchaseContact">
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={purchaseContactName}
                              name="purchaseContactName"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.nameContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={purchaseContactPosition}
                              name="purchaseContactPosition"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.positionContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={purchaseContactPhone}
                              name="purchaseContactPhone"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.phoneContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={purchaseContactMobile}
                              name="purchaseContactMobile"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.celphoneContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={purchaseContactEmail}
                              id="purchaseContactEmail"
                              name="purchaseContactEmail"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.emailContact"
                              invalid={sendForm && !!errors.purchaseContactEmail}
                              feedbackText={sendForm && (errors.purchaseContactEmail || null)}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="6">
                      <ContainerWithLabel label="page.customers.modal.modalNew.title.billingContact">
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={paymentContactName}
                              name="paymentContactName"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.nameContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={paymentContactPosition}
                              name="paymentContactPosition"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.positionContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={paymentContactPhone}
                              name="paymentContactPhone"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.phoneContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={paymentContactMobile}
                              id="paymentContactMobile"
                              name="paymentContactMobile"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.celphoneContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={paymentContactEmail}
                              name="paymentContactEmail"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.emailContact"
                              invalid={sendForm && !!errors.paymentContactEmail}
                              feedbackText={sendForm && (errors.paymentContactEmail || null)}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="3">
                  <Row>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="receivableCtaCode"
                        inputValue={receivableCtaCode}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.receivable"
                        invalid={sendForm && !!errors.receivableCtaCode}
                        feedbackText={sendForm && (errors.receivableCtaCode || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="discountCtaCode"
                        inputValue={discountCtaCode}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.discountAccount"
                        invalid={sendForm && !!errors.discountCtaCode}
                        feedbackText={sendForm && (errors.discountCtaCode || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="taxCtaCode"
                        inputValue={taxCtaCode}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.taxAccount"
                        invalid={sendForm && !!errors.taxCtaCode}
                        feedbackText={sendForm && (errors.taxCtaCode || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="freightCtaCode"
                        inputValue={freightCtaCode}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.freightAccount"
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="bonusCtaCode"
                        inputValue={bonusCtaCode}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.bonusAccount"
                      />
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
      <Modal {...propsToModalViewCust} />
    </>
  );
}
export default Customers;