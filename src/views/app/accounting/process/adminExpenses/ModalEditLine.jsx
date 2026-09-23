import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { IntlMessages } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'

// Modal "Editar Item" (cont_gastadmin_edit.sc2): No. Documento/Fecha/Descripción/Proveedor
// son texto libre (el legacy no tiene picker para Proveedor en esta pantalla, solo para
// Cuenta) — Exento/Gravado/Impuesto se suman para dar el Total, igual que el legacy.
const ModalEditLine = ({ data, setOpen }) => {
  const { line, listAccounts, fnUpdateLine } = data;

  const { formState, onInputChange, onBulkForm } = useForm({
    id: line.id,
    tempId: line.tempId,
    documentCode: line.documentCode,
    date: line.date,
    name: line.name,
    provider: line.provider,
    idCtaCont: line.idCtaCont,
    nomcta: line.nomcta,
    valExent: line.valExent,
    valGrav: line.valGrav,
    valTax: line.valTax
  });

  const { documentCode, date, name, provider, idCtaCont, valExent, valGrav, valTax } = formState;

  const onAccountChange = ({ target }) => {
    onBulkForm({ idCtaCont: target.value });
  }

  const fnAccept = () => {
    fnUpdateLine(formState);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="6">
            <InputField name="documentCode" label="page.adminExpenses.input.documentCode" value={documentCode} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6">
            <DateCalendar name="date" label="page.adminExpenses.input.lineDate" value={date} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="name" label="page.adminExpenses.input.description" value={name} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="provider" label="page.adminExpenses.input.provider" value={provider} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label="page.adminExpenses.input.account"
              name="idCtaCont"
              inputValue={idCtaCont}
              onChange={onAccountChange}
              options={listAccounts}
            />
          </Colxx>
          <Colxx xxs="4">
            <InputField name="valExent" label="page.adminExpenses.input.exempt" value={valExent} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="4">
            <InputField name="valGrav" label="page.adminExpenses.input.taxed" value={valGrav} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="4">
            <InputField name="valTax" label="page.adminExpenses.input.tax" value={valTax} onChange={onInputChange} type="text" />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEditLine
