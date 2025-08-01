import React from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { RadioGroup } from '@Components/radioGroup';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';

const BillingAreasDetail = ({ formState, listDocument, listLedgerAccount, listStores, onInputChange, sendForm, formValidation, isHospitalControl }) => {

  const {name, idCtaIng, idCtaDiscount, idCtaTax, idCtaCxc, idStore, codeDocument, localPriceType, outsiderPriceType, isDefault, useBilling, useRrhh, useFixedAssets, isHospital, idCtaRrhhFourteenth, idCtaRrhhNotice, idCtaRrhhSeverance,idCtaRrhhThirteenth, idCtaRrhhVacation, idCtaFaCost, idCtaFaDeprec, status } = formState;

  const {nameValid, idStoreValid, codeDocumentValid, localPriceTypeValid, outsiderPriceTypeValid} = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs={12} md={12} lg={6}>
          <InputField
            value={name}
            name="name"
            onChange={onInputChange}
            type="text"
            label ="page.billingAreas.input.description"
            invalid={sendForm && !!nameValid}
            feedbackText={sendForm && (nameValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} md={12} lg={6}>
          <Row>
            <Colxx xxs={12}>
              <ContainerWithLabel label="page.billingAreas.containerWithLabel.usage">
                <Row>
                  <Colxx md={4}>
                    <Checkbox
                    label="check.useIn.billing"
                    name="useBilling"
                    value={useBilling}
                    onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx md={4}>
                    <Checkbox
                    label="check.useIn.humanResource"
                    name="useRrhh"
                    value={useRrhh}
                    onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx md={4}>
                    <Checkbox
                    label="check.useIn.fixedAssets"
                    name="useFixedAssets"
                    value={useFixedAssets}
                    onChange={onInputChange}
                    />
                  </Colxx>
                  {isHospitalControl &&( <Colxx xxs={12}>
                      <Checkbox
                        label="check.isHospitalArea"
                        name="isHospital"
                        value={isHospital}
                        onChange={onInputChange}
                      />
                    </Colxx>)}
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12} sm={6}>
          <ContainerWithLabel label='page.billingAreas.ctLabel.billingCtas'>
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  label='page.billingAreas.select.idCtaIng'
                  name='idCtaIng'
                  inputValue={idCtaIng}
                  options={listLedgerAccount}
                  onChange={onInputChange}
                />
              </Colxx>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.discountaccount"
                  name="idCtaDiscount"
                  inputValue={idCtaDiscount}
                  options={listLedgerAccount}
                  onChange={onInputChange}
                  />
              </Colxx>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.idCtaTax"
                  name="idCtaTax"
                  inputValue={idCtaTax}
                  options={listLedgerAccount}
                  onChange={onInputChange}
                />
              </Colxx>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.idCtaCxc"
                  name="idCtaCxc"
                  inputValue={idCtaCxc}
                  options={listLedgerAccount}
                  onChange={onInputChange}
                />
              </Colxx>
            </Row>
            <hr/>
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.idStore"
                  name="idStore"
                  inputValue={idStore}
                  options={listStores}
                  onChange={onInputChange}
                  invalid={sendForm && !!idStoreValid}
                  feedbackText={sendForm && (idStoreValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.document"
                  name="codeDocument"
                  inputValue={codeDocument}
                  options={listDocument}
                  onChange={onInputChange}
                  invalid={sendForm && !!codeDocumentValid}
                  feedbackText={sendForm && (codeDocumentValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.billingAreas.title.salePrice">
                  <Row className="mb-2" >
                    <Colxx xxs="12">
                      <RadioGroup
                        label="page.billingAreas.title.localPriceType"
                        name="localPriceType"
                        value={localPriceType}
                        onChange={onInputChange}
                        display="flex"
                        options={
                          [
                            {id:1, label:'page.billingAreas.radio.localPriceType.minimum'},
                            {id:2, label:'page.billingAreas.radio.localPriceType.medium'},
                            {id:3, label:'page.billingAreas.radio.localPriceType.maximum'}
                          ]
                        }
                        invalid={sendForm && !!localPriceTypeValid}
                        feedbackText={sendForm && (localPriceTypeValid || null)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12">
                      <RadioGroup
                          label="page.billingAreas.title.foreignClients"
                          name="outsiderPriceType"
                          value={outsiderPriceType}
                          onChange={onInputChange}
                          display="flex"
                          options={
                            [
                              {id:1, label:'page.billingAreas.radio.foreignClients.minimum'},
                              {id:2, label:'page.billingAreas.radio.foreignClients.medium'},
                              {id:3, label:'page.billingAreas.radio.foreignClients.maximum'}
                            ]
                          }
                          invalid={sendForm && !!outsiderPriceTypeValid}
                          feedbackText={sendForm && (outsiderPriceTypeValid || null)}
                        />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs={12} sm={6}>
          <Row>
            <Colxx xxs={12}>
              <ContainerWithLabel label='page.billingAreas.containerWithLabel.useHumanResources'>
                <Row>
                  <Colxx xxs={12}>
                    <SearchSelect
                      label='page.areas.select.idCtaRrhhSeverance'
                      name='idCtaRrhhSeverance'
                      inputValue={idCtaRrhhSeverance}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <SearchSelect
                      label='page.areas.select.idCtaRrhhNotice'
                      name='idCtaRrhhSeverance'
                      inputValue={idCtaRrhhNotice}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <SearchSelect
                      label='page.areas.select.idCtaRrhhVacation'
                      name='idCtaRrhhVacation'
                      inputValue={idCtaRrhhVacation}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <SearchSelect
                      label='page.areas.select.idCtaRrhhThirteenth'
                      name='idCtaRrhhThirteenth'
                      inputValue={idCtaRrhhThirteenth}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <SearchSelect
                      label='page.areas.select.idCtaRrhhFourteenth'
                      name='idCtaRrhhFourteenth'
                      inputValue={idCtaRrhhFourteenth}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
            <Colxx xxs={12}>
              <ContainerWithLabel label="page.billingAreas.containerWithLabel.useFixedAssets">
                <Row>
                  <Colxx xxs={12}>
                  <SearchSelect
                      label='page.fixedAssets.input.accDeprecation'
                      name='idCtaFaDeprec'
                      inputValue={idCtaFaDeprec}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                  <SearchSelect
                      label='page.fixedAssets.input.accCost'
                      name='idCtaFaCost'
                      inputValue={idCtaFaCost}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
            <Colxx xxs={12} sm={6} lg={4}>
              <Checkbox
                label="page.billingAreas.check.active"
                name="status"
                value={status}
                onChange={onInputChange}
              />
            </Colxx>
            <Colxx xxs={12} sm={6} lg={4}>
              <Checkbox
                label="check.isDefault"
                name="isDefault"
                value={isDefault}
                onChange={onInputChange}
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </>
  )
}

export default BillingAreasDetail