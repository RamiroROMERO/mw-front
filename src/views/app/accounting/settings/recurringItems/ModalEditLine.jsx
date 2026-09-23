import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { IntlMessages } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'

// Modal "Editar Item" (cont_pdasedititem3.sc2): el legacy solo dejaba tocar Cuenta+Debe+
// Haber; acá también se puede corregir la Referencia de la línea, mismo criterio ya usado
// en dailyItems/ModalEditLine.jsx para no obligar a borrar y re-crear la línea por un typo.
const ModalEditLine = ({ data, setOpen }) => {
  const { line, listAccounts, fnUpdateLine } = data;

  const { formState, onInputChange, onBulkForm } = useForm({
    id: line.id,
    tempId: line.tempId,
    idCtaAccount: line.idCtaAccount,
    name: line.name,
    referenceCode: line.referenceCode || '',
    valDebe: line.valDebe,
    valHaber: line.valHaber
  });

  const { idCtaAccount, referenceCode, valDebe, valHaber } = formState;

  const onAccountChange = ({ target }) => {
    onBulkForm({ idCtaAccount: target.value });
  }

  const fnAccept = () => {
    fnUpdateLine(formState);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label="page.recurringItems.input.account"
              name="idCtaAccount"
              inputValue={idCtaAccount}
              onChange={onAccountChange}
              options={listAccounts}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="referenceCode" label="page.recurringItems.input.reference" value={referenceCode} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6">
            <InputField name="valDebe" label="page.recurringItems.input.debit" value={valDebe} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6">
            <InputField name="valHaber" label="page.recurringItems.input.credit" value={valHaber} onChange={onInputChange} type="text" />
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
