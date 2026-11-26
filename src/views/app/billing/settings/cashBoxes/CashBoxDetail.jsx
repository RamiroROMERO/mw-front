import { Row, Button } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { MAX_NAME } from './cashBoxRules';

// Formulario de Cajas de cobro (fac_cajas.sc2). Obligatorios con `*` (nombre y las dos cuentas); el área es opcional como en el legacy. `feedbackText` recibe la CLAVE
// de traducción (el componente la traduce). Las cuentas, que en el legacy eran un buscador F1, se conservan como combos con búsqueda.
const CashBoxDetail = (props) => {

  const { formState, errors, sendForm, listBillingArea, listLedgerAccount, onInputChange, fnSave, fnClearInputs } = props;

  const { name, cashCtaCode, depositCtaCode, billingAreaId, status } = formState;
  const error = (field) => (sendForm ? errors[field] : undefined);

  return (
    <>
      <Row>
        <Colxx xxs="8" sm="6" lg="8">
          <InputField
            label='page.cashBoxes.input.nameRequired'
            name="name"
            value={name}
            maxLength={MAX_NAME}
            onChange={onInputChange}
            invalid={!!error('name')}
            feedbackText={error('name')}
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
            label='page.cashBoxes.select.cashAccountRequired'
            name='cashCtaCode'
            inputValue={cashCtaCode}
            options={listLedgerAccount}
            onChange={onInputChange}
            invalid={!!error('cashCtaCode')}
            feedbackText={error('cashCtaCode')}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="12">
          <SearchSelect
            label='page.cashBoxes.select.depositAccountRequired'
            name='depositCtaCode'
            inputValue={depositCtaCode}
            options={listLedgerAccount}
            onChange={onInputChange}
            invalid={!!error('depositCtaCode')}
            feedbackText={error('depositCtaCode')}
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
      <hr />
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
