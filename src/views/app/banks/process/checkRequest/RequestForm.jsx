import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { SimpleSelect } from '@/components/simpleSelect';
import DateCalendar from '@/components/dateCalendar';
import { InputField } from '@/components/inputFields';
import { IntlMessages, formatNumber, validFloat } from "@/helpers/Utils";
import { RadioGroup } from '@/components/radioGroup';
import { ContainerWithLabel } from '@/components/containerWithLabel';

export const RequestForm = (props) => {

  const { formStateIndex, onInputChangeIndex, listBeneficiary, listAccountType, formValidationIndex, sendForm } = props;

  const { id, date, valueCurrency, typeRequest, letterValue, beneficiaryId, conceptPayment, accountType, nameBank, numberAccount, nameBeneficiary, rtn, email } = formStateIndex;

  const { dateValid, valueCurrencyValid,
    typeRequestValid,
    beneficiaryIdValid,
    conceptPaymentValid } = formValidationIndex;
  return (
    <Row>
      <Colxx xss="12">
        <Row>
          <Colxx xss="12" xs="6" lg="6">
            <Row>
              <Colxx xss="12" xs="12" lg="12">
                <DateCalendar
                  name="date"
                  value={date}
                  label="select.date"
                  onChange={onInputChangeIndex}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && dateValid || null}
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <InputField
                  name="valueCurrency"
                  value={valueCurrency}
                  label="page.checkRequest.input.valueCurrency"
                  onChange={onInputChangeIndex}
                  invalid={sendForm && !!valueCurrencyValid}
                  feedbackText={sendForm && valueCurrencyValid || null}
                />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xss="12" xs="6" lg="6">
            <Row className="mb-2" >
              <Colxx xxs="12">
                <RadioGroup
                  label="page.checkRequest.title.typeRequest"
                  name="typeRequest"
                  value={typeRequest}
                  onChange={onInputChangeIndex}
                  display="flex"
                  invalid={sendForm && !!typeRequestValid}
                  feedbackText={sendForm && typeRequestValid || null}
                  options={
                    [
                      { id: 1, label: 'page.checkRequest.radio.typeRequest.checkLps' },
                      { id: 2, label: 'page.checkRequest.radio.typeRequest.transferLps' },
                      { id: 3, label: 'page.checkRequest.radio.typeRequest.checkUsd' },
                      { id: 4, label: 'page.checkRequest.radio.typeRequest.transferUsd' }
                    ]
                  }
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row className='mb-3'>
          <Colxx xss="12" xs="6" lg="6">
            <InputField
              name="letterValue"
              value={letterValue}
              label="page.checkRequest.input.letterValue"
              onChange={onInputChangeIndex}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="6">
            <SearchSelect
              name="benefiiaryId"
              inputValue={beneficiaryId}
              onChange={onInputChangeIndex}
              label="select.beneficiary"
              options={listBeneficiary}
              invalid={sendForm && !!beneficiaryIdValid}
              feedbackText={sendForm && beneficiaryIdValid || null}
            />
          </Colxx>
          <Colxx xss="12" xs="12" lg="12">
            <InputField
              name="conceptPayment"
              value={conceptPayment}
              label="input.conceptPayment"
              onChange={onInputChangeIndex}
              type="textarea"
              invalid={sendForm && !!conceptPaymentValid}
              feedbackText={sendForm && conceptPaymentValid || null}
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx>
            <ContainerWithLabel label="page.checkRequest.title.request">
              <Row>
                <Colxx xss="12" xs="6" sm="6" lg="4">
                  <SimpleSelect
                    name="accountType"
                    value={accountType}
                    onChange={onInputChangeIndex}
                    label="select.accountType"
                    options={listAccountType}

                  />
                </Colxx>
                <Colxx xss="12" xs="6" sm="6" lg="4">
                  <InputField
                    name="nameBank"
                    value={nameBank}
                    onChange={onInputChangeIndex}
                    label="input.checkRequest.input.nameBank"
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" sm="6" lg="4">
                  <InputField
                    name="numberAccount"
                    value={numberAccount}
                    onChange={onInputChangeIndex}
                    label="input.checkRequest.input.numberAccount"
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" sm="6" lg="4">
                  <InputField
                    name="nameBeneficiary"
                    value={nameBeneficiary}
                    onChange={onInputChangeIndex}
                    label="input.beneficiary"
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" sm="6" lg="4">
                  <InputField
                    name="rtn"
                    value={rtn}
                    onChange={onInputChangeIndex}
                    label="input.checkRequest.input.rtnBeneficiary"
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" sm="6" lg="4">
                  <InputField
                    name="email"
                    value={email}
                    onChange={onInputChangeIndex}
                    label="input.email"
                    type="text"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

