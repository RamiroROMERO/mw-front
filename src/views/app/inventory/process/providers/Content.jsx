import { Card, CardBody, Row, Form, Table, Button } from 'reactstrap';
import { useIntl } from "react-intl";
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import Modal from "@Components/modal";
import { useProviders } from './useProviders';
import { DNI_MAX, MAX_NAME, MAX_PHONE, MAX_EMAIL, MAX_CONTACT, MAX_CONTACT_PHONE } from './providerRules';

const Providers = (props) => {
  const { setLoading } = props;
  // useIntl se llama siempre y arriba: IntlMessages es un hook y, dentro del map de las cuentas bancarias, cambiaba el orden de los hooks
  // al aparecer la primera fila.
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });

  const { formState, errors, accountingActive, onInputChange, sendForm, propsToControlPanel,
    propsToModalBankAccount,
    propsToModalBillingData,
    propsToModalViewProv,
    propsToModalUpdateAllAccounts,
    propsToMsgDeleteAccount,
    propsToMsgDeleteProv,
    listTypeProviders,
    listLedgerAccounts,
    dataBankAccounts,
    fnAddAccount,
    fnEditAccount,
    fnDeleteAccount,
    isCoffeeControl,
    isHospitalControl } = useProviders({ setLoading });

  const { id, dni, name, providerTypeId, phone, email, address, paymentConditions, creditDays, shipDays, isInternational, isPettyCash,
    status, isProducer, isPartner, contactManager, contactManagerPhone, contactContab, contactContabPhone, contactSales, contactSalesPhone,
    contactLogistic, contactLogisticPhone, payableCtaCode, discountCtaCode, taxCtaCode, freightCtaCode, bonusCtaCode, otherCtaCode, taxCertificateDateOut,
    percHosp, percProv } = formState;

  const showError = (field) => (sendForm && errors[field]) || null;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <Form>
                <Row>
                  <Colxx xxs="12" xs="12" sm="12" md="6">
                    <Row>
                      <Colxx xxs="12" sm="6" md="12" lg="6">
                        <SimpleSelect
                          name="providerTypeId"
                          value={providerTypeId}
                          onChange={onInputChange}
                          label="page.providers.select.typeProviderRequired"
                          options={listTypeProviders}
                          invalid={sendForm && !!errors.providerTypeId}
                          feedbackText={showError('providerTypeId')}
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="6" md="12" lg="6">
                        <InputField
                          value={dni}
                          name="dni"
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.dniRequired"
                          maxLength={DNI_MAX}
                          invalid={sendForm && !!errors.dni}
                          feedbackText={showError('dni')}
                        />
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12">
                        <InputField
                          value={name}
                          name="name"
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.nameRequired"
                          maxLength={MAX_NAME}
                          invalid={sendForm && !!errors.name}
                          feedbackText={showError('name')}
                        />
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12" sm="5" md="12" lg="5">
                        <InputField
                          value={phone}
                          name="phone"
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.phoneRequired"
                          maxLength={MAX_PHONE}
                          invalid={sendForm && !!errors.phone}
                          feedbackText={showError('phone')}
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="7" md="12" lg="7">
                        <InputField
                          value={email}
                          name="email"
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.emailRequired"
                          maxLength={MAX_EMAIL}
                          invalid={sendForm && !!errors.email}
                          feedbackText={showError('email')}
                        />
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12">
                        <InputField
                          value={address}
                          name="address"
                          onChange={onInputChange}
                          type="textarea"
                          label="page.providers.input.address"
                        />
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12">
                        <InputField
                          value={paymentConditions}
                          name="paymentConditions"
                          onChange={onInputChange}
                          type="textarea"
                          label="page.providers.input.conditions"
                        />
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12" sm="4" md="6" lg="4">
                        <InputField
                          value={creditDays}
                          name="creditDays"
                          invalid={sendForm && !!errors.creditDays}
                          feedbackText={showError('creditDays')}
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.creditDays"
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="4" md="6" lg="4">
                        <InputField
                          value={shipDays}
                          name="shipDays"
                          invalid={sendForm && !!errors.shipDays}
                          feedbackText={showError('shipDays')}
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.shipDays"
                        />
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12" sm="8" md="12" lg="8">
                        <DateCalendar
                          value={taxCertificateDateOut}
                          label="page.providers.input.expirationCert"
                          onChange={onInputChange}
                          name="taxCertificateDateOut"
                        />
                      </Colxx>
                    </Row>
                  </Colxx>
                  <Colxx xxs="12" xs="12" sm="12" md="6">
                    <Row>
                      <Colxx xxs="12" xs="4" md="6" lg="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="isInternational"
                          value={isInternational}
                          label="page.providers.check.international"
                        />
                      </Colxx>
                      <Colxx xxs="12" xs="4" md="6" lg="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="isPettyCash"
                          value={isPettyCash}
                          label="page.providers.check.pettyCash"
                        />
                      </Colxx>
                      <Colxx xxs="12" xs="4" md="6" lg="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="status"
                          value={status}
                          label="page.providers.check.status"
                        />
                      </Colxx>
                    </Row>
                    {isCoffeeControl && (<Row>
                      <Colxx xxs="12" xs="4" md="6" lg="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="isProducer"
                          value={isProducer}
                          label="page.providers.check.isProducer"
                        />
                      </Colxx>
                      <Colxx xxs="12" xs="4" md="6" lg="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="isPartner"
                          value={isPartner}
                          label="page.providers.check.isPartner"
                        />
                      </Colxx>
                    </Row>)}
                    {isHospitalControl && (<Row>
                      <Colxx xxs="12" xs="6" md="6" lg="6">
                        <InputField
                          value={percHosp}
                          name="percHosp"
                          invalid={sendForm && !!errors.percHosp}
                          feedbackText={showError('percHosp')}
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.percHosp"
                        />
                      </Colxx>
                      <Colxx xxs="12" xs="6" md="6" lg="6">
                        <InputField
                          value={percProv}
                          name="percProv"
                          invalid={sendForm && !!errors.percProv}
                          feedbackText={showError('percProv')}
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.percProv"
                        />
                      </Colxx>
                    </Row>)}
                    <Row>
                      <Colxx xxs="12">
                        <ContainerWithLabel label="page.providers.title.contacts">
                          <Row>
                            <Colxx xxs="12" xs="7" md="12" lg="7">
                              <InputField
                                value={contactManager}
                                name="contactManager"
                                maxLength={MAX_CONTACT}
                                invalid={sendForm && !!errors.contactManager}
                                feedbackText={showError('contactManager')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.managementName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactManagerPhone}
                                name="contactManagerPhone"
                                maxLength={MAX_CONTACT_PHONE}
                                invalid={sendForm && !!errors.contactManagerPhone}
                                feedbackText={showError('contactManagerPhone')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.phone"
                              />
                            </Colxx>
                          </Row>
                          <Row>
                            <Colxx xxs="12" xs="7" md="12" lg="7">
                              <InputField
                                value={contactContab}
                                name="contactContab"
                                maxLength={MAX_CONTACT}
                                invalid={sendForm && !!errors.contactContab}
                                feedbackText={showError('contactContab')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.accountingName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactContabPhone}
                                name="contactContabPhone"
                                maxLength={MAX_CONTACT_PHONE}
                                invalid={sendForm && !!errors.contactContabPhone}
                                feedbackText={showError('contactContabPhone')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.phone"
                              />
                            </Colxx>
                          </Row>
                          <Row>
                            <Colxx xxs="12" xs="7" md="12" lg="7">
                              <InputField
                                value={contactSales}
                                name="contactSales"
                                maxLength={MAX_CONTACT}
                                invalid={sendForm && !!errors.contactSales}
                                feedbackText={showError('contactSales')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.salesName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactSalesPhone}
                                name="contactSalesPhone"
                                maxLength={MAX_CONTACT_PHONE}
                                invalid={sendForm && !!errors.contactSalesPhone}
                                feedbackText={showError('contactSalesPhone')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.phone"
                              />
                            </Colxx>
                          </Row>
                          <Row>
                            <Colxx xxs="12" xs="7" md="12" lg="7">
                              <InputField
                                value={contactLogistic}
                                name="contactLogistic"
                                maxLength={MAX_CONTACT}
                                invalid={sendForm && !!errors.contactLogistic}
                                feedbackText={showError('contactLogistic')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.logisticsName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactLogisticPhone}
                                name="contactLogisticPhone"
                                maxLength={MAX_CONTACT_PHONE}
                                invalid={sendForm && !!errors.contactLogisticPhone}
                                feedbackText={showError('contactLogisticPhone')}
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.phone"
                              />
                            </Colxx>
                          </Row>
                        </ContainerWithLabel>
                      </Colxx>
                    </Row>
                    <Row>
                      <Colxx xxs="12">
                        <ContainerWithLabel label="page.providers.title.bankAccounts">
                          <Row className="mb-1">
                            <Colxx xxs="12" align="right">
                              <Button type="button" className="btn-circle-table" color="primary" title={t("button.new")}
                                onClick={() => { fnAddAccount(id) }}>
                                <i className='bi bi-plus' />
                              </Button>
                            </Colxx>
                          </Row>
                          <Row>
                            <Colxx xxs="12">
                              <Table bordered hover>
                                <thead>
                                  <tr>
                                    <th>{t("page.providers.table.column.bank")}</th>
                                    <th>{t("page.providers.table.column.account")}</th>
                                    <th>{t("table.column.options")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dataBankAccounts.map((item, idx) => {
                                    return (
                                      <tr id={`tr-table-dataproducts-${item.id}`} key={idx}>
                                        <th scope="row">{item.bankName}</th>
                                        <td>{item.bankCtaCode}</td>
                                        <td className="text-end">
                                          <Button type="button" className="btn-circle-table" color="warning" title={t("button.edit")}
                                            onClick={() => { fnEditAccount(item) }}>
                                            <i className='bi bi-pencil' />
                                          </Button>
                                          <Button type="button" className="btn-circle-table" color="danger" title={t("button.delete")}
                                            onClick={() => { fnDeleteAccount(item) }}>
                                            <i className='bi bi-trash' />
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </Colxx>
                          </Row>
                        </ContainerWithLabel>
                      </Colxx>
                    </Row>
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.providers.title.ledgerAccounts">
                      <Row>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label={accountingActive ? "page.providers.select.accountsPayableRequired" : "page.providers.select.accountsPayable"}
                            name="payableCtaCode"
                            inputValue={payableCtaCode}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!errors.payableCtaCode}
                            feedbackText={showError('payableCtaCode')}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label={accountingActive ? "page.providers.select.discountAccountsRequired" : "page.providers.select.discountAccounts"}
                            name="discountCtaCode"
                            inputValue={discountCtaCode}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!errors.discountCtaCode}
                            feedbackText={showError('discountCtaCode')}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label={accountingActive ? "page.providers.select.ivaAccountsRequired" : "page.providers.select.ivaAccounts"}
                            name="taxCtaCode"
                            inputValue={taxCtaCode}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!errors.taxCtaCode}
                            feedbackText={showError('taxCtaCode')}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.freightAccounts"
                            name="freightCtaCode"
                            inputValue={freightCtaCode}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!errors.freightCtaCode}
                            feedbackText={showError('freightCtaCode')}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.bonusAccounts"
                            name="bonusCtaCode"
                            inputValue={bonusCtaCode}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.otherSurcharges"
                            name="otherCtaCode"
                            inputValue={otherCtaCode}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!errors.otherCtaCode}
                            feedbackText={showError('otherCtaCode')}
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalBankAccount} />
      <Modal {...propsToModalViewProv} />
      <Modal {...propsToModalBillingData} />
      <Modal {...propsToModalUpdateAllAccounts} />
      <Confirmation {...propsToMsgDeleteAccount} />
      <Confirmation {...propsToMsgDeleteProv} />
    </>
  );
}
export default Providers;