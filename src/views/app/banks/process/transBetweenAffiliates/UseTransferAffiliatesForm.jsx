import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';

export const UseTransferAffiliatesForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listDocIn, listBanks, listAffiliates, formValidationIndex, sendForm } = props;

  const {
    date, description, value, exchangeRate, documentCodeIn, documentIdIn, bankCodeIn, bankAccountNameIn,
    referenceIn, affiliatedId, documentCodeOut, documentNameOut, documentIdOut, bankCodeOut, bankNameOut,
    bankNumberOut, affiliateContCta, referenceOut
  } = formStateIndex;

  const {
    dateValid, descriptionValid, documentCodeInValid, bankCodeInValid, referenceInValid, affiliatedIdValid,
    documentCodeOutValid, bankCodeOutValid, referenceOutValid
  } = formValidationIndex;

  return (
    <>
      <Row className='mb-3'>
        <Colxx xxs="12" md="3">
          <DateCalendar
            name="date"
            value={date}
            onChange={onInputChangeIndex}
            label="select.date"
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && dateValid || null}
          />
        </Colxx>
        <Colxx xxs="6" md="3">
          <InputField name="value" value={value} onChange={onInputChangeIndex} label="input.valueLps" type="text" />
        </Colxx>
        <Colxx xxs="6" md="3">
          <InputField name="exchangeRate" value={exchangeRate} onChange={onInputChangeIndex} label="input.rateExchange" type="text" />
        </Colxx>
        <Colxx xxs="12" md="3">
          <SearchSelect
            name="affiliatedId"
            inputValue={affiliatedId}
            onChange={onInputChangeIndex}
            label="page.transferAffiliates.select.affiliate"
            options={listAffiliates}
            invalid={sendForm && !!affiliatedIdValid}
            feedbackText={sendForm && affiliatedIdValid || null}
          />
        </Colxx>
        <Colxx xxs="12">
          <InputField
            name="description"
            value={description}
            onChange={onInputChangeIndex}
            label="page.variousDeposits.input.description"
            type="textarea"
            invalid={sendForm && !!descriptionValid}
            feedbackText={sendForm && descriptionValid || null}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" md="6" className="mb-3">
          <ContainerWithLabel label="page.transferAffiliates.title.local">
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  name="documentCodeIn"
                  inputValue={documentCodeIn}
                  onChange={onInputChangeIndex}
                  label="input.document"
                  options={listDocIn}
                  invalid={sendForm && !!documentCodeInValid}
                  feedbackText={sendForm && documentCodeInValid || null}
                />
              </Colxx>
              <Colxx xxs="8">
                <SearchSelect
                  name="bankCodeIn"
                  inputValue={bankCodeIn}
                  onChange={onInputChangeIndex}
                  label="select.bankCode"
                  options={listBanks}
                  invalid={sendForm && !!bankCodeInValid}
                  feedbackText={sendForm && bankCodeInValid || null}
                />
              </Colxx>
              <Colxx xxs="4">
                <InputField name="bankAccountNameIn" value={bankAccountNameIn} onChange={onInputChangeIndex} label="input.numberAccount" type="text" disabled />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="referenceIn"
                  value={referenceIn}
                  onChange={onInputChangeIndex}
                  label="page.transferAccounts.input.referenceIn"
                  type="text"
                  invalid={sendForm && !!referenceInValid}
                  feedbackText={sendForm && referenceInValid || null}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField name="documentIdIn" value={documentIdIn} onChange={onInputChangeIndex} label="page.variousDeposits.input.documentNumber" type="text" disabled />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs="12" md="6" className="mb-3">
          <ContainerWithLabel label="page.transferAffiliates.title.affiliate">
            <Row>
              <Colxx xxs="8">
                <InputField
                  name="documentCodeOut"
                  value={documentCodeOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAffiliates.input.affiliateDocumentCode"
                  type="text"
                  invalid={sendForm && !!documentCodeOutValid}
                  feedbackText={sendForm && documentCodeOutValid || null}
                />
              </Colxx>
              <Colxx xxs="4">
                <InputField name="documentIdOut" value={documentIdOut} onChange={onInputChangeIndex} label="page.variousDeposits.input.documentNumber" type="text" />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="documentNameOut"
                  value={documentNameOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAffiliates.input.affiliateDocumentName"
                  type="text"
                />
              </Colxx>
              <Colxx xxs="6">
                <InputField
                  name="bankCodeOut"
                  value={bankCodeOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAffiliates.input.affiliateBankCode"
                  type="text"
                  invalid={sendForm && !!bankCodeOutValid}
                  feedbackText={sendForm && bankCodeOutValid || null}
                />
              </Colxx>
              <Colxx xxs="6">
                <InputField
                  name="bankNameOut"
                  value={bankNameOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAffiliates.input.affiliateBankName"
                  type="text"
                />
              </Colxx>
              <Colxx xxs="6">
                <InputField
                  name="bankNumberOut"
                  value={bankNumberOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAffiliates.input.affiliateBankNumber"
                  type="text"
                />
              </Colxx>
              <Colxx xxs="6">
                <InputField
                  name="affiliateContCta"
                  value={affiliateContCta}
                  onChange={onInputChangeIndex}
                  label="page.transferAffiliates.input.affiliateContCta"
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="referenceOut"
                  value={referenceOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAccounts.input.referenceOut"
                  type="text"
                  invalid={sendForm && !!referenceOutValid}
                  feedbackText={sendForm && referenceOutValid || null}
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </>
  )
}
