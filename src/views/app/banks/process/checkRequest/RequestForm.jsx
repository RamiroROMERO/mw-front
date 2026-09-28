import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { SimpleSelect } from '@Components/simpleSelect';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';

const ACCOUNT_TYPES = [
  { value: '', label: '' },
  { value: 'Cuenta de Ahorro', label: 'Cuenta de Ahorro' },
  { value: 'Cuenta de Cheques', label: 'Cuenta de Cheques' },
  { value: 'Cuenta de Ahorro en Dolares', label: 'Cuenta de Ahorro en Dolares' },
  { value: 'Cuenta de Cheques en Dolares', label: 'Cuenta de Cheques en Dolares' }
];

export const RequestForm = ({ formStateIndex, onInputChangeIndex, listProvider, formValidationIndex, sendForm, isTransfer }) => {
  const {
    date, value, typeId, providerId, providerName, concept, bankName, bankAccount, accountType,
    beneficiaryAccountName, beneficiaryRtn, beneficiaryEmail
  } = formStateIndex;

  const {
    dateValid, valueValid, typeIdValid, providerNameValid, conceptValid
  } = formValidationIndex;

  return (
    <Row>
      <Colxx xxs="12">
        <Row>
          <Colxx xxs="12" sm="6" lg="3">
            <DateCalendar
              name="date"
              value={date}
              label="select.date"
              onChange={onInputChangeIndex}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && dateValid || null}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="3">
            <InputField
              name="value"
              value={value}
              label="page.checkRequest.input.value"
              onChange={onInputChangeIndex}
              type="text"
              invalid={sendForm && !!valueValid}
              feedbackText={sendForm && valueValid || null}
            />
          </Colxx>
          <Colxx xxs="12" lg="6">
            <RadioGroup
              label="page.checkRequest.title.typeRequest"
              name="typeId"
              value={typeId}
              onChange={onInputChangeIndex}
              display="flex"
              feedbackText={sendForm && typeIdValid || null}
              options={[
                { id: 1, label: 'page.checkRequest.radio.typeRequest.checkLps' },
                { id: 2, label: 'page.checkRequest.radio.typeRequest.checkUsd' },
                { id: 3, label: 'page.checkRequest.radio.typeRequest.transferLps' },
                { id: 4, label: 'page.checkRequest.radio.typeRequest.transferUsd' }
              ]}
            />
          </Colxx>
        </Row>
        <Row className="mb-3">
          <Colxx xxs="12" sm="6">
            <SearchSelect
              name="providerId"
              inputValue={providerId}
              onChange={onInputChangeIndex}
              label="page.checkRequest.select.provider"
              options={listProvider}
            />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <InputField
              name="providerName"
              value={providerName}
              onChange={onInputChangeIndex}
              label="page.checkRequest.input.beneficiary"
              type="text"
              invalid={sendForm && !!providerNameValid}
              feedbackText={sendForm && providerNameValid || null}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="concept"
              value={concept}
              onChange={onInputChangeIndex}
              label="page.checkRequest.input.concept"
              type="textarea"
              invalid={sendForm && !!conceptValid}
              feedbackText={sendForm && conceptValid || null}
            />
          </Colxx>
        </Row>
        {isTransfer && (
          <Row className="mb-2">
            <Colxx xxs="12">
              <ContainerWithLabel label="page.checkRequest.title.transferData">
                <Row>
                  <Colxx xxs="12" sm="6" lg="4">
                    <InputField
                      name="bankName"
                      value={bankName}
                      onChange={onInputChangeIndex}
                      label="page.checkRequest.input.bankName"
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="4">
                    <SimpleSelect
                      name="accountType"
                      value={accountType}
                      onChange={onInputChangeIndex}
                      label="page.checkRequest.select.accountType"
                      options={ACCOUNT_TYPES}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="4">
                    <InputField
                      name="bankAccount"
                      value={bankAccount}
                      onChange={onInputChangeIndex}
                      label="page.checkRequest.input.bankAccount"
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="4">
                    <InputField
                      name="beneficiaryAccountName"
                      value={beneficiaryAccountName}
                      onChange={onInputChangeIndex}
                      label="page.checkRequest.input.beneficiaryAccountName"
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="4">
                    <InputField
                      name="beneficiaryRtn"
                      value={beneficiaryRtn}
                      onChange={onInputChangeIndex}
                      label="page.checkRequest.input.rtn"
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="4">
                    <InputField
                      name="beneficiaryEmail"
                      value={beneficiaryEmail}
                      onChange={onInputChangeIndex}
                      label="page.checkRequest.input.email"
                      type="text"
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        )}
      </Colxx>
    </Row>
  );
}
