import React from 'react';
import { Card, CardBody, Row, Button } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import { SimpleSelect } from '@/components/simpleSelect';
// import InputMask from 'react-input-mask';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import DateCalendar from '@/components/dateCalendar';
import { useContent } from './useContent';

const LedgerAccounts = (props) => {
  const { setLoading } = props;

  const { listTypeAccount, listTypeSpent, listCurrency, formState, formValidation, onInputChange, sendForm, table, fnClearInputs, fnSave, propsToMsgDelete } = useContent({ setLoading });

  const { code, name, accountTypeId, expenseTypeId, currencyId, opera, detailAux, postIn, lastDate, status } = formState;

  const { codeValid, nameValid, accountTypeValid, expenseTypeValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="4">
          <Card className='mb-5'>
            <CardBody>
              <Row>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={code}
                    name="code"
                    mask="***.**.**.**"
                    maskChar=" "
                    tag={InputMask}
                    onChange={onInputChange}
                    label="page.ledgerAccounts.input.code"
                    invalid={sendForm && !!codeValid}
                    feedbackText={sendForm && (codeValid || null)}
                  />
                </Colxx>
                <Colxx xss="12" sm="6" lg="12">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    label="page.ledgerAccounts.input.name"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xss="12" sm="6" lg="12">
                  <SimpleSelect
                    name="accountTypeId"
                    label="page.ledgerAccount.select.typeAccount"
                    value={accountTypeId}
                    onChange={onInputChange}
                    options={listTypeAccount}
                    invalid={sendForm && !!accountTypeValid}
                    feedbackText={sendForm && (accountTypeValid || null)}
                  />
                </Colxx>
                <Colxx xss="12" sm="6" lg="12">
                  <SimpleSelect
                    label="page.ledgerAccount.select.typeSpent"
                    name="expenseTypeId"
                    value={expenseTypeId}
                    onChange={onInputChange}
                    options={listTypeSpent}
                    invalid={sendForm && !!expenseTypeValid}
                    feedbackText={sendForm && (expenseTypeValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xss="12" sm="6" lg="12">
                  <DateCalendar
                    label="page.ledgerAccount.input.dateClosing"
                    value={lastDate}
                    name="lastDate"
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xss="12" sm="6" lg="12">
                  <SimpleSelect
                    label="page.ledgerAccount.select.typeCurrency"
                    name="currencyId"
                    onChange={onInputChange}
                    value={currencyId}
                    options={listCurrency}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xss="12" xs="6" md="4" lg="12">
                  <Checkbox
                    onChange={onInputChange}
                    name="opera"
                    value={opera}
                    label="page.ledgerAccounts.check.posteable"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" md="4" lg="12">
                  <Checkbox
                    onChange={onInputChange}
                    name="detailAux"
                    value={detailAux}
                    label="page.ledgerAccounts.check.detailAuxiliary"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" md="4" lg="12">
                  <Checkbox
                    onChange={onInputChange}
                    name="postIn"
                    value={postIn}
                    label="page.ledgerAccounts.check.accountingSeat"
                  />
                </Colxx>
                <Colxx xss="12" xs="6" md="4" lg="12">
                  <Checkbox
                    onChange={onInputChange}
                    name="status"
                    value={status}
                    label="page.ledgerAccounts.check.active"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                  <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="8">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default LedgerAccounts;