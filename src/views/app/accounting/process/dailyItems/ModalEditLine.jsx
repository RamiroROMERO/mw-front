import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { IntlMessages } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'

// Modal "Editar Item" (cont_pdasedititem2.sc2): a diferencia del legacy (que solo dejaba
// tocar Cuenta+Debe+Haber), acá también se puede corregir Referencia de la línea ya
// agregada, para no obligar a borrarla y re-crearla por un typo. La Descripción no es un
// campo manual: se deriva del nombre de la cuenta seleccionada (el select ya lo muestra).
const ModalEditLine = ({ data, setOpen }) => {
  const { line, listAccounts, listCustomers, listProviders, fnUpdateLine } = data;

  const { formState, onInputChange, onBulkForm } = useForm({
    id: line.id,
    tempId: line.tempId,
    accountNumber: line.accountNumber,
    description: line.description,
    reference: line.reference || '',
    valueDebit: line.valueDebit,
    valueCredit: line.valueCredit,
    customerId: line.customerId || '',
    providerId: line.providerId || ''
  });

  const { accountNumber, reference, valueDebit, valueCredit, customerId, providerId } = formState;

  const onAccountChange = ({ target }) => {
    const account = listAccounts.find((a) => a.value === target.value);
    onBulkForm({ accountNumber: target.value, description: account?.name || '' });
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
              label="page.dailyItems.input.account"
              name="accountNumber"
              inputValue={accountNumber}
              onChange={onAccountChange}
              options={listAccounts}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="reference" label="page.dailyItems.input.reference" value={reference} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6">
            <InputField name="valueDebit" label="page.dailyItems.input.debit" value={valueDebit} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6">
            <InputField name="valueCredit" label="page.dailyItems.input.credit" value={valueCredit} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label="page.dailyItems.input.customer"
              name="customerId"
              inputValue={customerId}
              onChange={onInputChange}
              options={listCustomers}
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label="page.dailyItems.input.provider"
              name="providerId"
              inputValue={providerId}
              onChange={onInputChange}
              options={listProviders}
            />
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
