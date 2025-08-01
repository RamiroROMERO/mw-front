import React from 'react';
import { Card, CardBody, Row, Form, Table, Button } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import { Checkbox } from '@/components/checkbox';
import { SimpleSelect } from '@/components/simpleSelect';
import { InputField } from '@/components/inputFields';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import ControlPanel from '@/components/controlPanel';
import Confirmation from '@/containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@/components/dateCalendar';
import Modal from "@/components/modal";
import { useProviders } from './useProviders';

const Providers = (props) => {
  const { setLoading } = props;

  const { formState, formValidation, onInputChange, sendForm, propsToControlPanel,
    propsToModalBankAccount,
    propsToModalBillingData,
    propsToModalViewProv,
    propsToMsgDeleteAccount,
    propsToMsgDeleteProv,
    listTypeProviders,
    listLedgerAccounts,
    dataBankAccounts,
    fnAddAccount,
    fnEditAccount,
    fnDeleteAccount,
    isCoffeeControl } = useProviders({ setLoading });

  const { id, dni, name, providerType, phone, email, address, paymentConditions, creditDays, shipDays, isInternational, isPettyCash,
    status, isProducer, isPartner, contactManager, contactManagerPhone, contactContab, contactContabPhone, contactSales, contactSalesPhone,
    contactLogistic, contactLogisticPhone, idCtaCxp, idCtaDes, idCtaTax, idCtaFle, idCtaBonific, idCtaOthers, taxCertificateDateOut } =
    formState;

  const { providerTypeValid, dniValid, nameValid, phoneValid, emailValid, idCtaCxpValid, idCtaDesValid, idCtaTaxValid, idCtaFleValid,
    idCtaOthersValid } = formValidation;

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
                          name="providerType"
                          value={providerType}
                          onChange={onInputChange}
                          label="page.providers.select.typeProvider"
                          options={listTypeProviders}
                          invalid={sendForm && !!providerTypeValid}
                          feedbackText={sendForm && (providerTypeValid || null)}
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="6" md="12" lg="6">
                        <InputField
                          value={dni}
                          name="dni"
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.dni"
                          invalid={sendForm && !!dniValid}
                          feedbackText={sendForm && (dniValid || null)}
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
                          label="page.providers.input.name"
                          invalid={sendForm && !!nameValid}
                          feedbackText={sendForm && (nameValid || null)}
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
                          label="page.providers.input.phone"
                          invalid={sendForm && !!phoneValid}
                          feedbackText={sendForm && (phoneValid || null)}
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="7" md="12" lg="7">
                        <InputField
                          value={email}
                          name="email"
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.email"
                          invalid={sendForm && !!emailValid}
                          feedbackText={sendForm && (emailValid || null)}
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
                          onChange={onInputChange}
                          type="text"
                          label="page.providers.input.creditDays"
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="4" md="6" lg="4">
                        <InputField
                          value={shipDays}
                          name="shipDays"
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
                    <Row>
                      <Colxx xxs="12">
                        <ContainerWithLabel label="page.providers.title.contacts">
                          <Row>
                            <Colxx xxs="12" xs="7" md="12" lg="7">
                              <InputField
                                value={contactManager}
                                name="contactManager"
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.managementName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactManagerPhone}
                                name="contactManagerPhone"
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
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.accountingName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactContabPhone}
                                name="contactContabPhone"
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
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.salesName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactSalesPhone}
                                name="contactSalesPhone"
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
                                onChange={onInputChange}
                                type="text"
                                label="page.providers.input.logisticsName"
                              />
                            </Colxx>
                            <Colxx xxs="12" xs="5" md="12" lg="5">
                              <InputField
                                value={contactLogisticPhone}
                                name="contactLogisticPhone"
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
                              <Button type="button" className="btn-circle-table" color="primary" title={IntlMessages("button.new")}
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
                                    <th>{IntlMessages("page.providers.table.column.bank")}</th>
                                    <th>{IntlMessages("page.providers.table.column.account")}</th>
                                    <th>{IntlMessages("table.column.options")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dataBankAccounts.map((item, idx) => {
                                    return (
                                      <tr id={`tr-table-dataproducts-${item.id}`} key={idx}>
                                        <th scope="row">{item.bankName}</th>
                                        <td>{item.bankCtaCode}</td>
                                        <td className="text-right">
                                          <Button type="button" className="btn-circle-table" color="warning" title={IntlMessages("button.edit")}
                                            onClick={() => { fnEditAccount(item) }}>
                                            <i className='bi bi-pencil' />
                                          </Button>
                                          <Button type="button" className="btn-circle-table" color="danger" title={IntlMessages("button.delete")}
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
                            label="page.providers.select.accountsPayable"
                            name="idCtaCxp"
                            inputValue={idCtaCxp}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!idCtaCxpValid}
                            feedbackText={sendForm && (idCtaCxpValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.discountAccounts"
                            name="idCtaDes"
                            inputValue={idCtaDes}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!idCtaDesValid}
                            feedbackText={sendForm && (idCtaDesValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.ivaAccounts"
                            name="idCtaTax"
                            inputValue={idCtaTax}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!idCtaTaxValid}
                            feedbackText={sendForm && (idCtaTaxValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.freightAccounts"
                            name="idCtaFle"
                            inputValue={idCtaFle}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!idCtaFleValid}
                            feedbackText={sendForm && (idCtaFleValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.bonusAccounts"
                            name="idCtaBonific"
                            inputValue={idCtaBonific}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="6" md="12" lg={6}>
                          <SearchSelect
                            label="page.providers.select.otherSurcharges"
                            name="idCtaOthers"
                            inputValue={idCtaOthers}
                            onChange={onInputChange}
                            options={listLedgerAccounts}
                            invalid={sendForm && !!idCtaOthersValid}
                            feedbackText={sendForm && (idCtaOthersValid || null)}
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
      <Confirmation {...propsToMsgDeleteAccount} />
      <Confirmation {...propsToMsgDeleteProv} />
    </>
  );
}
export default Providers;