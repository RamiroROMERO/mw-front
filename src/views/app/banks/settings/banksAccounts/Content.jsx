import { Card, CardBody, Row, Button } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { SimpleSelect } from '@/components/simpleSelect';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import ReactTable from "@/components/reactTable";
import Confirmation from '@/containers/ui/confirmationMsg';
import { useBankAccounts } from './useBankAccounts';

const BanksAccounts = (props) => {
  const { setLoading } = props;

  const {sendForm, table, propsToMsgDelete, formState, formValidation, listAccount, listCurrency, fnClearInputs, fnSave, onInputChange} = useBankAccounts({setLoading});

  const { code, status, bankNumber, name, currentCheck, currencyName, ctaBank, ctaShortage, ctaMissing } = formState;

  const { codeValid, bankNumberValid, nameValid, currentCheckValid, ctaBankValid, ctaShortageValid, ctaMissingValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className='mb-3'>
            <CardBody>
              <Row>
                <Colxx xxs="12" sm="6" lg="6">
                  <InputField
                    name="code"
                    label="page.banksAccount.input.code"
                    value={code}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!codeValid}
                    feedbackText={sendForm && (codeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="6">
                  <InputField
                    label="page.banksAccounts.input.bankNumber"
                    value={bankNumber}
                    name="bankNumber"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!bankNumberValid}
                    feedbackText={sendForm && (bankNumberValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    name="name"
                    label="page.bankAccounts.input.description"
                    onChange={onInputChange}
                    type="text"
                    value={name}
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="6">
                  <InputField
                    name="currentCheck"
                    label="page.banksAccounts.input.currentCheck"
                    value={currentCheck}
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!currentCheckValid}
                    feedbackText={sendForm && (currentCheckValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="6">
                  <SimpleSelect
                    name="currencyName"
                    label="page.banksAccounts.select.typeCurrency"
                    value={currencyName}
                    onChange={onInputChange}
                    options={listCurrency}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <SearchSelect
                    label="page.banksAccounts.select.ctaBank"
                    name="ctaBank"
                    onChange={onInputChange}
                    inputValue={ctaBank}
                    options={listAccount}
                    invalid={sendForm && !!ctaBankValid}
                    feedbackText={sendForm && (ctaBankValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <SearchSelect
                    label="page.banksAccounts.select.ctaShortage"
                    name="ctaShortage"
                    onChange={onInputChange}
                    inputValue={ctaShortage}
                    options={listAccount}
                    invalid={sendForm && !!ctaShortageValid}
                    feedbackText={sendForm && (ctaShortageValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <SearchSelect
                    label="page.banksAccounts.select.ctaMissing"
                    name="ctaMissing"
                    onChange={onInputChange}
                    inputValue={ctaMissing}
                    options={listAccount}
                    invalid={sendForm && !!ctaMissingValid}
                    feedbackText={sendForm && (ctaMissingValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <Checkbox
                    label="page.bankAccounts.checkbos.status"
                    name="status"
                    onChange={onInputChange}
                    value={status}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button
                    color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
                  </Button>
                  <Button
                    color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default BanksAccounts;