import { Row, Button } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import SearchSelect from '@/components/SearchSelect/SearchSelect';

const CashBoxDetail = (props) => {

  const { formState, formValidation, sendForm, listBillingArea, listLedgerAccount, onInputChange, fnSave, fnClearInputs } = props;

  const { name, idCtaCash, idCtaDeposit, billingAreaId, status } = formState;

  const {nameValid, idCtaCashValid, idCtaDepositValid} = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="8" sm="6" lg="8">
          <InputField
            label='page.cashBoxes.input.name'
            name="name"
            value={name}
            onChange={onInputChange}
            invalid={sendForm && !!nameValid}
            feedbackText={sendForm && (nameValid || null)}
          />
        </Colxx>
        <Colxx xxs="4" align="right">
          <Checkbox
            label="page.cashBoxes.check.active"
            name="status"
            value={status}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" sm="6" lg="12">
          <SearchSelect
            label='page.cashBoxes.select.cashAccount'
            name='idCtaCash'
            inputValue={idCtaCash}
            options={listLedgerAccount}
            onChange={onInputChange}
            invalid={sendForm && !!idCtaCashValid}
            feedbackText={sendForm && (idCtaCashValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="12">
          <SearchSelect
            label='page.cashBoxes.select.depositAccount'
            name='idCtaDeposit'
            inputValue={idCtaDeposit}
            options={listLedgerAccount}
            onChange={onInputChange}
            invalid={sendForm && !!idCtaDepositValid}
            feedbackText={sendForm && (idCtaDepositValid || null)}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" sm="6" lg="12">
          <SearchSelect
            label='page.cashBoxes.select.billingArea'
            name='billingAreaId'
            inputValue={billingAreaId}
            options={listBillingArea}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
          <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        </Colxx>
      </Row>
    </>
  )
};

export default CashBoxDetail;